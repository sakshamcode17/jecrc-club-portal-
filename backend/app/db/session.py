from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool
from urllib.parse import urlsplit

from app.core.config import settings


def _normalize_database_url(database_url: str) -> str:
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+psycopg://", 1)
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_url


def _is_asyncpg_url(database_url: str) -> bool:
    return database_url.startswith("postgresql+asyncpg://")


def _is_supabase_transaction_pooler(database_url: str) -> bool:
    parsed = urlsplit(database_url)
    host = parsed.hostname or ""
    is_supabase_pooler = host.endswith("pooler.supabase.com") or host.endswith("supabase.co")
    is_transaction_port = parsed.port == 6543
    return is_supabase_pooler and is_transaction_port


def _build_engine():
    database_url = _normalize_database_url(settings.DATABASE_URL)

    engine_kwargs = {
        "echo": settings.SQL_ECHO,
        "future": True,
    }

    if _is_supabase_transaction_pooler(database_url) or settings.DB_USE_NULL_POOL:
        engine_kwargs["poolclass"] = NullPool

    disable_asyncpg_prepared_statements = _is_asyncpg_url(database_url) and (
        _is_supabase_transaction_pooler(database_url) or settings.DB_DISABLE_PREPARED_STATEMENTS
    )
    if disable_asyncpg_prepared_statements:
        connect_args = dict(engine_kwargs.get("connect_args", {}))
        connect_args["prepared_statement_cache_size"] = 0
        engine_kwargs["connect_args"] = connect_args

    return create_async_engine(database_url, **engine_kwargs)


engine = _build_engine()

async_session = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

async def get_db():
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
