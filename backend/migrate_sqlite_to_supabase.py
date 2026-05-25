import argparse
import asyncio
import os
import selectors
import sys
from urllib.parse import urlsplit

from sqlalchemy import insert, inspect, select, text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.models.models import Base


def _build_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Migrate data from local SQLite to Supabase/Postgres."
    )
    parser.add_argument(
        "--source-url",
        default=os.getenv("SQLITE_DATABASE_URL", "sqlite+aiosqlite:///./sql_app.db"),
        help="SQLite source URL. Default: sqlite+aiosqlite:///./sql_app.db",
    )
    parser.add_argument(
        "--target-url",
        default=os.getenv("SUPABASE_DATABASE_URL", settings.DATABASE_URL),
        help="Supabase/Postgres target URL. Defaults to SUPABASE_DATABASE_URL or DATABASE_URL.",
    )
    parser.add_argument(
        "--no-truncate",
        action="store_true",
        help="Do not clear target tables before inserting data.",
    )
    parser.add_argument(
        "--drop-and-recreate",
        action="store_true",
        help="Drop and recreate target schema before importing (destructive).",
    )
    return parser.parse_args()


def _validate_urls(source_url: str, target_url: str) -> None:
    if not source_url.startswith("sqlite+aiosqlite://"):
        raise ValueError(
            "Source DB must use sqlite+aiosqlite. "
            f"Received source URL: {source_url}"
        )

    if not target_url.startswith(
        ("postgresql+asyncpg://", "postgresql+psycopg://", "postgres://", "postgresql://")
    ):
        raise ValueError(
            "Target DB must be PostgreSQL/Supabase. "
            f"Received target URL: {target_url}"
        )


def _normalize_target_url(target_url: str) -> str:
    if target_url.startswith("postgres://"):
        return target_url.replace("postgres://", "postgresql+psycopg://", 1)
    if target_url.startswith("postgresql://"):
        return target_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return target_url


def _is_asyncpg_url(url: str) -> bool:
    return url.startswith("postgresql+asyncpg://")


def _is_psycopg_url(url: str) -> bool:
    return url.startswith("postgresql+psycopg://")


def _is_supabase_url(url: str) -> bool:
    host = urlsplit(url).hostname or ""
    return host.endswith("supabase.co") or host.endswith("supabase.com")


async def _truncate_target(conn) -> None:
    table_names = [f'"{table.name}"' for table in Base.metadata.sorted_tables]
    if not table_names:
        return
    await conn.execute(
        text(f"TRUNCATE TABLE {', '.join(table_names)} RESTART IDENTITY CASCADE;")
    )


async def _copy_table(source_conn, target_conn, table) -> int:
    result = await source_conn.execute(select(table))
    rows = [dict(row) for row in result.mappings().all()]
    if not rows:
        return 0

    await target_conn.execute(insert(table), rows)
    return len(rows)


async def _sync_id_sequence(conn, table_name: str) -> None:
    sql = text(
        f"""
        SELECT setval(
            pg_get_serial_sequence('"{table_name}"', 'id'),
            COALESCE((SELECT MAX(id) FROM "{table_name}"), 1),
            (SELECT COUNT(*) > 0 FROM "{table_name}")
        );
        """
    )
    await conn.execute(sql)


async def _run_migration(source_url: str, target_url: str, no_truncate: bool, drop_and_recreate: bool) -> None:
    target_url = _normalize_target_url(target_url)
    source_engine = create_async_engine(source_url, echo=False, future=True)

    target_engine_kwargs = {
        "echo": False,
        "future": True,
    }
    if _is_asyncpg_url(target_url):
        target_engine_kwargs["connect_args"] = {"prepared_statement_cache_size": 0}
    if urlsplit(target_url).port == 6543:
        target_engine_kwargs["poolclass"] = NullPool

    target_engine = create_async_engine(target_url, **target_engine_kwargs)

    try:
        async with source_engine.connect() as source_conn:
            source_tables = set(
                await source_conn.run_sync(
                    lambda sync_conn: inspect(sync_conn).get_table_names()
                )
            )
            async with target_engine.begin() as target_conn:
                if drop_and_recreate:
                    print("Dropping and recreating target schema...")
                    await target_conn.run_sync(Base.metadata.drop_all)

                print("Ensuring target schema exists...")
                await target_conn.run_sync(Base.metadata.create_all)

                if not no_truncate and not drop_and_recreate:
                    print("Clearing target tables...")
                    await _truncate_target(target_conn)

                total_rows = 0
                print("\nCopying data table by table:")
                for table in Base.metadata.sorted_tables:
                    if table.name not in source_tables:
                        print(f"  - {table.name}: skipped (not present in source)")
                        continue
                    copied = await _copy_table(source_conn, target_conn, table)
                    total_rows += copied
                    print(f"  - {table.name}: {copied} row(s)")

                for table in Base.metadata.sorted_tables:
                    if "id" in table.c and table.c["id"].primary_key:
                        await _sync_id_sequence(target_conn, table.name)

                print(f"\nMigration complete. Total rows copied: {total_rows}")
    finally:
        await source_engine.dispose()
        await target_engine.dispose()


def main() -> None:
    args = _build_args()
    _validate_urls(args.source_url, args.target_url)
    normalized_target_url = _normalize_target_url(args.target_url)

    if _is_supabase_url(args.target_url):
        print("Target looks like Supabase. Using PostgreSQL import flow.")
    else:
        print("Target is PostgreSQL (non-Supabase). Using the same import flow.")

    coro = _run_migration(
        source_url=args.source_url,
        target_url=normalized_target_url,
        no_truncate=args.no_truncate,
        drop_and_recreate=args.drop_and_recreate,
    )
    # psycopg async requires selector loop on Windows.
    if sys.platform == "win32" and _is_psycopg_url(normalized_target_url):
        asyncio.run(
            coro,
            loop_factory=lambda: asyncio.SelectorEventLoop(selectors.SelectSelector()),
        )
    else:
        asyncio.run(coro)


if __name__ == "__main__":
    main()
