INSERT INTO schema_migrations (filename)
VALUES ('002_seed_admin.sql')
ON CONFLICT (filename) DO NOTHING;
