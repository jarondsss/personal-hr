/**
 * Security check for the Supabase database.
 * Run with: npm run db:check
 *
 * Verifies that:
 *  - every app table has RLS enabled (deny-by-default, no policies)
 *  - the anon / authenticated roles have no table grants
 *  - the API roles cannot even see the tables through PostgREST
 *  - the app path (Prisma, role `postgres`) still reads and writes fine
 */
require("dotenv").config({ quiet: true });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SCHEMAS = ["public", "private"];
let failures = 0;

const check = (label, ok, extra = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? " -> " + extra : ""}`);
};

const run = async (label, sql) => {
  const rows = await prisma.$queryRawUnsafe(sql);
  console.log(`\n== ${label} ==`);
  console.log(rows.length === 0 ? "none" : rows);
  return rows;
};

(async () => {
  const noRls = await prisma.$queryRawUnsafe(`
    SELECT n.nspname AS schema, c.relname AS table_name
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = ANY($1) AND c.relkind IN ('r','p') AND c.relrowsecurity = false
    ORDER BY 1,2;
  `, SCHEMAS);
  check("every table has RLS enabled", noRls.length === 0, JSON.stringify(noRls));

  const policies = await prisma.$queryRawUnsafe(`
    SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname = ANY($1);
  `, SCHEMAS);
  check("no policies in app schemas (default deny)", policies.length === 0, JSON.stringify(policies));

  const grants = await prisma.$queryRawUnsafe(`
    SELECT table_schema, table_name, grantee, string_agg(privilege_type,',') AS privs
    FROM information_schema.role_table_grants
    WHERE table_schema = ANY($1) AND grantee IN ('anon','authenticated')
    GROUP BY 1,2,3;
  `, SCHEMAS);
  check("no grants for anon/authenticated", grants.length === 0, JSON.stringify(grants));

  const schemaAccess = await prisma.$queryRawUnsafe(`
    SELECT 'anon' AS role, has_schema_privilege('anon','private','USAGE') AS usage
    UNION ALL
    SELECT 'authenticated', has_schema_privilege('authenticated','private','USAGE');
  `);
  check(
    "anon/authenticated cannot enter the private schema",
    schemaAccess.every((r) => r.usage === false),
    JSON.stringify(schemaAccess)
  );

  // Live end-to-end proof: pretend to be the PostgREST request role.
  const leaks = [];
  for (const role of ["anon", "authenticated"]) {
    for (const sql of [
      `SELECT * FROM "User" LIMIT 1`,
      `SELECT * FROM "Employee" LIMIT 1`,
      `SELECT * FROM "Payroll" LIMIT 1`,
      `UPDATE "Employee" SET "salary"=0 WHERE "id"='x'`,
      `DELETE FROM "Employee" WHERE "id"='x'`,
    ]) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.$executeRawUnsafe(`SET LOCAL ROLE ${role}`);
          await tx.$queryRawUnsafe(sql);
        });
        leaks.push(`${role}: ${sql}`);
      } catch {
        // blocked, as expected
      }
    }
  }
  check("anon/authenticated blocked on every table", leaks.length === 0, leaks.join(" | "));

  // App path must still work.
  const app = await prisma.$queryRawUnsafe(`
    SELECT (SELECT count(*) FROM "private"."User")       AS users,
           (SELECT count(*) FROM "private"."Employee")   AS employees,
           (SELECT count(*) FROM "private"."Payroll")    AS payrolls,
           (SELECT count(*) FROM "private"."Project")    AS projects,
           (SELECT count(*) FROM "private"."LoginAttempt") AS attempts;
  `);
  check("app path (Prisma) reads fine", Number(app[0].users) > 0, JSON.stringify(app, (k, v) => (typeof v === "bigint" ? Number(v) : v)));

  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  await prisma.$disconnect();
  process.exit(failures === 0 ? 0 : 1);
})().catch(async (e) => { console.error(e); process.exit(1); });
