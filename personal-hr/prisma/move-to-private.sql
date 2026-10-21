-- Move the app tables out of the PostgREST-exposed `public` schema.
--
-- Why: Supabase's PostgREST only exposes `public` (pgrst.db_schemas default).
-- Tables living in `private` are invisible to the public API — not just
-- denied, but undiscoverable (no table names leaked via the API).
--
-- Prisma only talks to this database through the `postgres` role, so moving
-- the tables does not change how the app reads/writes them.
--
-- Safe to re-run (skips tables that are already in `private`).

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

-- Keep the API roles out of the new schema entirely.
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
GRANT USAGE ON SCHEMA private TO postgres, service_role;

-- Move every application table. _prisma_migrations stays in public.
DO $$
DECLARE
  tbl record;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  LOOP
    EXECUTE format('ALTER TABLE public.%I SET SCHEMA private', tbl.tablename);
  END LOOP;
END
$$;

-- New tables created in `private` must never be granted to the API roles.
ALTER DEFAULT PRIVILEGES IN SCHEMA private REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA private REVOKE ALL ON SEQUENCES FROM anon, authenticated;

COMMIT;
