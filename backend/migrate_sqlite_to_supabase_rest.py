import argparse
import json
import sqlite3
from pathlib import Path
from typing import Any

import httpx


INSERT_ORDER = [
    "users",
    "clubs",
    "club_members",
    "projects",
    "club_leaders",
    "events",
    "applications",
    "directory",
]

DELETE_ORDER = [
    "club_members",
    "applications",
    "events",
    "projects",
    "club_leaders",
    "directory",
    "users",
    "clubs",
]

BOOL_COLUMNS = {
    "users": {"is_active", "is_admin"},
    "clubs": {"is_accepting"},
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Migrate local SQLite data to Supabase via REST API."
    )
    parser.add_argument(
        "--source-db",
        default="sql_app.db",
        help="Path to SQLite DB file (default: sql_app.db).",
    )
    parser.add_argument(
        "--base-url",
        required=True,
        help="Supabase REST base URL, e.g. https://<ref>.supabase.co/rest/v1/",
    )
    parser.add_argument(
        "--service-key",
        required=True,
        help="Supabase secret/service key (sb_secret_... or legacy service_role).",
    )
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=500,
        help="Rows per insert request (default: 500).",
    )
    return parser.parse_args()


def normalize_base_url(base_url: str) -> str:
    return base_url.rstrip("/") + "/"


def get_existing_tables(conn: sqlite3.Connection) -> set[str]:
    rows = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()
    return {row[0] for row in rows}


def fetch_table_rows(conn: sqlite3.Connection, table: str) -> list[dict[str, Any]]:
    cols_info = conn.execute(f"PRAGMA table_info({table})").fetchall()
    columns = [row[1] for row in cols_info]
    if not columns:
        return []

    rows = conn.execute(f"SELECT * FROM {table}").fetchall()
    payload: list[dict[str, Any]] = []
    for raw_row in rows:
        record = dict(zip(columns, raw_row))
        for bool_col in BOOL_COLUMNS.get(table, set()):
            if bool_col in record and record[bool_col] is not None:
                record[bool_col] = bool(record[bool_col])
        payload.append(record)
    return payload


def build_headers(service_key: str, prefer: str | None = None) -> dict[str, str]:
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


def call_api(
    client: httpx.Client,
    method: str,
    url: str,
    headers: dict[str, str],
    params: dict[str, str] | None = None,
    body: Any = None,
) -> httpx.Response:
    response = client.request(method, url, headers=headers, params=params, json=body)
    if response.status_code >= 300:
        detail = response.text
        raise RuntimeError(
            f"{method} {url} failed with {response.status_code}: {detail[:800]}"
        )
    return response


def delete_table_rows(client: httpx.Client, base_url: str, service_key: str, table: str) -> None:
    endpoint = f"{base_url}{table}"
    # PostgREST requires a filter for DELETE; these match every row for existing numeric PK/FK columns.
    params = {"user_id": "gte.0"} if table == "club_members" else {"id": "gte.0"}
    call_api(client, "DELETE", endpoint, build_headers(service_key), params=params)


def insert_rows(
    client: httpx.Client,
    base_url: str,
    service_key: str,
    table: str,
    rows: list[dict[str, Any]],
    chunk_size: int,
) -> None:
    if not rows:
        return

    endpoint = f"{base_url}{table}"
    prefer = "resolution=merge-duplicates,return=minimal"
    headers = build_headers(service_key, prefer=prefer)
    for i in range(0, len(rows), chunk_size):
        batch = rows[i : i + chunk_size]
        call_api(client, "POST", endpoint, headers, body=batch)


def main() -> None:
    args = parse_args()
    base_url = normalize_base_url(args.base_url)

    source_path = Path(args.source_db)
    if not source_path.exists():
        raise FileNotFoundError(f"SQLite DB not found: {source_path}")

    with sqlite3.connect(source_path) as conn, httpx.Client(timeout=120.0) as client:
        conn.row_factory = sqlite3.Row
        existing_tables = get_existing_tables(conn)

        print("Clearing target tables...")
        for table in DELETE_ORDER:
            try:
                delete_table_rows(client, base_url, args.service_key, table)
                print(f"  - {table}: cleared")
            except RuntimeError as exc:
                # If table is empty or absent in exposed schema, keep moving.
                print(f"  - {table}: skip clear ({exc})")

        total = 0
        print("\nInserting rows...")
        for table in INSERT_ORDER:
            if table not in existing_tables:
                print(f"  - {table}: skipped (missing in SQLite)")
                continue

            rows = fetch_table_rows(conn, table)
            insert_rows(
                client=client,
                base_url=base_url,
                service_key=args.service_key,
                table=table,
                rows=rows,
                chunk_size=args.chunk_size,
            )
            total += len(rows)
            print(f"  - {table}: {len(rows)} row(s)")

        print(f"\nREST migration complete. Total rows inserted: {total}")
        print(
            "Important: if new inserts later fail with duplicate id, run sequence reset SQL in Supabase dashboard."
        )


if __name__ == "__main__":
    main()
