-- Docker Postgres runs files in /docker-entrypoint-initdb.d after 01_schema.sql (same as db/migrations/001_initial_schema.sql).
-- This keeps npm run db:migrate in sync: the initial migration is already applied.
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO schema_migrations (filename)
VALUES ('001_initial_schema.sql')
ON CONFLICT (filename) DO NOTHING;
