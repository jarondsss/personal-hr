/**
 * Applies the database schema and re-locks the Supabase schema, then verifies
 * the result. Runs as part of `npm run build` so a deploy can never ship code
 * that expects a schema the database does not have - and can never ship a
 * table that is left unprotected.
 *
 * Guards:
 *  - Vercel preview / development builds are skipped (they must not touch the
 *    production database).
 *  - SKIP_SCHEMA=1 forces a skip.
 *  - Every step fails the build on error (fail closed, never fail open).
 *  - Credentials are passed through the environment, never on the command
 *    line, so they cannot leak into the build log.
 */
const { execFileSync } = require("node:child_process");
const path = require("node:path");

require("dotenv").config({ quiet: true });

const root = path.join(__dirname, "..");
const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");
const schemaPath = "prisma/schema.prisma";

const vercelEnv = process.env.VERCEL_ENV;

function log(message) {
  console.log(`[schema] ${message}`);
}

if (process.env.SKIP_SCHEMA === "1") {
  log("skipped (SKIP_SCHEMA=1)");
  process.exit(0);
}

if (vercelEnv && vercelEnv !== "production") {
  log(`skipped (VERCEL_ENV=${vercelEnv}, only production builds apply the schema)`);
  process.exit(0);
}

function run(args, env) {
  log(args.join(" "));
  execFileSync(process.execPath, [prismaCli, ...args], {
    cwd: root,
    stdio: "inherit",
    env: env ?? process.env,
  });
}

try {
  // 0. Pre-flight: fail early with a message that says what is missing,
  //    instead of a cryptic Prisma error halfway through the build.
  const required = ["DATABASE_URL", "DIRECT_URL"];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(
      `[schema] FAILED - missing environment variable(s): ${missing.join(", ")}`
    );
    console.error(
      "[schema] Add them in Vercel -> Settings -> Environment Variables (Production scope),"
    );
    console.error(
      "[schema] or run the build locally where .env is loaded automatically."
    );
    process.exit(1);
  }

  // 1. Sync the schema. Fails on destructive changes instead of dropping data.
  run(["db", "push", "--schema", schemaPath, "--skip-generate"]);

  // 2. Re-apply the RLS lockdown (idempotent).
  //    The direct connection is used for DDL: the transaction pooler is not a
  //    good fit for it. It goes through the environment, not the command line.
  const env = { ...process.env };
  if (env.DIRECT_URL) {
    env.DATABASE_URL = env.DIRECT_URL;
  }
  run(["db", "execute", "--file", "prisma/rls-lockdown.sql", "--schema", schemaPath], env);

  // 3. Verify: every table protected, API roles locked out, app still reads.
  log("verifying");
  execFileSync(process.execPath, [path.join(root, "prisma", "rls-check.js")], {
    cwd: root,
    stdio: "inherit",
  });

  log("schema applied and verified");
} catch (error) {
  console.error(
    "[schema] FAILED - the build is aborted so nothing is deployed in a broken state."
  );
  process.exit(1);
}
