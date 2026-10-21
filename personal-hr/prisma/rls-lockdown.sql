-- Lock down the application schema for Supabase.
--
-- This app never talks to the database through PostgREST / supabase-js.
-- Every query goes through Prisma using the `postgres` role, which has
-- BYPASSRLS, so enabling RLS with zero policies closes the public API
-- surface without breaking the app.
--
-- The app tables live in the `private` schema (see prisma/move-to-private.sql),
-- which PostgREST does not expose at all. The rules below are applied to both
-- `public` and `private` so a table can never end up unprotected.
--
-- Safe to re-run.

BEGIN;

-- 1. Enable RLS on every existing table, in every schema we manage.
--    No policies are created on purpose: default deny.
DO $$
DECLARE
  tbl record;
BEGIN
  FOR tbl IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname IN ('public', 'private')
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', tbl.schemaname, tbl.tablename);
  END LOOP;
END
$$;

-- 2. Remove direct table/sequence privileges from the API roles.
DO $$
DECLARE
  tbl record;
BEGIN
  FOR tbl IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname IN ('public', 'private')
  LOOP
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE %I.%I FROM anon, authenticated', tbl.schemaname, tbl.tablename);
  END LOOP;

  FOR tbl IN
    SELECT schemaname, sequencename
    FROM pg_sequences
    WHERE schemaname IN ('public', 'private')
  LOOP
    EXECUTE format('REVOKE ALL PRIVILEGES ON SEQUENCE %I.%I FROM anon, authenticated', tbl.schemaname, tbl.sequencename);
  END LOOP;
END
$$;

-- 3. The API roles must not even be able to enter the app schema.
REVOKE ALL ON SCHEMA private FROM anon, authenticated;

-- 4. Stop future tables (created by prisma db push / migrate as `postgres`)
--    from being granted to the API roles automatically.
ALTER DEFAULT PRIVILEGES IN SCHEMA public  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA private REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA private REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA private REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;

COMMIT;
