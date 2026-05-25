# SQLite to Supabase Migration

This project already uses async SQLAlchemy, so moving to Supabase is mostly a connection + data migration step.

## 1. Install dependencies

From `backend/`:

```bash
pip install -r requirements.txt
```

## 2. Set your Supabase database URL

Update `backend/.env`:

```env
# Option A: Direct connection (port 5432)
DATABASE_URL=postgresql+psycopg://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require

# Option B: Transaction pooler (port 6543, serverless-friendly)
# DATABASE_URL=postgresql+psycopg://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```

Notes:
- If you use pooler port `6543`, this backend auto-switches to `NullPool`.
- `psycopg` is the default PostgreSQL driver in this project; `asyncpg` remains optional for Python versions where wheels are available.
- Keep credentials secret; never commit real values to git.

## 3. Run SQLite -> Supabase data migration

From `backend/`:

```bash
python migrate_sqlite_to_supabase.py
```

Optional flags:

```bash
# Keep existing target rows (default behavior is truncate target tables)
python migrate_sqlite_to_supabase.py --no-truncate

# Fully reset target schema before import
python migrate_sqlite_to_supabase.py --drop-and-recreate

# Explicit target URL (overrides DATABASE_URL)
python migrate_sqlite_to_supabase.py --target-url "postgresql+psycopg://..."
```

The script:
- creates missing tables on target
- copies all mapped table rows from `sql_app.db`
- restores integer id sequences after import

## 4. Start backend against Supabase

From `backend/`:

```bash
uvicorn app.main:app --reload
```

## 5. Quick verification checklist

- `GET /health` returns `{"status":"healthy"}`
- login works for existing users
- club list/events/directory endpoints return expected records
