/**
 * Dump every table of a schema to JSON on disk.
 * Usage: node prisma/backup.js [schema=public]
 *
 * Produces prisma/backups/<timestamp>/<Table>.json + manifest.json
 * Restore manually with prisma/restore.js (see manifest for insert order).
 */
require("dotenv").config({ quiet: true });
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const schema = process.argv[2] || "public";

(async () => {
  const tables = await prisma.$queryRawUnsafe(`
    SELECT tablename FROM pg_tables WHERE schemaname = $1 ORDER BY tablename;
  `, schema);
  if (tables.length === 0) throw new Error(`no tables in schema "${schema}"`);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.join(__dirname, "backups", stamp);
  fs.mkdirSync(outDir, { recursive: true });

  const manifest = { schema, createdAt: new Date().toISOString(), tables: [] };

  for (const { tablename } of tables) {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT * FROM ${schema}."${tablename}"`
    );
    const file = `${tablename}.json`;
    fs.writeFileSync(
      path.join(outDir, file),
      JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2)
    );
    manifest.tables.push({ name: tablename, file, rows: rows.length });
    console.log(`${tablename.padEnd(24)} ${String(rows.length).padStart(6)} rows`);
  }

  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`\nbackup written to ${outDir}`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); process.exit(1); });
