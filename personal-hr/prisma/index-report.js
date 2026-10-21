/**
 * Reports foreign keys without a covering index, plus index usage stats.
 * Usage: node prisma/index-report.js
 */
require("dotenv").config({ quiet: true });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const fks = await prisma.$queryRawUnsafe(`
    SELECT
      ns.nspname AS schema,
      c.relname  AS table_name,
      a.attname  AS column_name,
      con.conname AS constraint_name,
      pg_get_constraintdef(con.oid) AS definition
    FROM pg_constraint con
    JOIN pg_class c        ON c.oid = con.conrelid
    JOIN pg_namespace ns    ON ns.oid = c.relnamespace
    JOIN unnest(con.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
    JOIN pg_attribute a     ON a.attrelid = c.oid AND a.attnum = k.attnum
    WHERE con.contype = 'f'
      AND ns.nspname IN ('public','private')
    ORDER BY ns.nspname, c.relname, a.attname;
  `);

  const indexes = await prisma.$queryRawUnsafe(`
    SELECT
      ns.nspname AS schema,
      t.relname  AS table_name,
      i.relname  AS index_name,
      ix.indisunique AS is_unique,
      ix.indisprimary AS is_primary,
      pg_get_indexdef(ix.indexrelid) AS definition,
      COALESCE(s.idx_scan, 0) AS scans
    FROM pg_index ix
    JOIN pg_class i      ON i.oid = ix.indexrelid
    JOIN pg_class t      ON t.oid = ix.indrelid
    JOIN pg_namespace ns ON ns.oid = t.relnamespace
    LEFT JOIN pg_stat_user_indexes s ON s.indexrelid = ix.indexrelid
    WHERE ns.nspname IN ('public','private')
    ORDER BY ns.nspname, t.relname, i.relname;
  `);

  // Does an index cover this FK column as its FIRST column?
  const indexColumns = (ix) => {
    const m = (ix.definition || "").match(/USING btree \(([^)]*)\)/);
    if (!m) return [];
    return m[1].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  };
  const covered = (table, column) =>
    indexes.some(
      (ix) => ix.table_name === table && indexColumns(ix)[0] === column
    );

  const rowCounts = await prisma.$queryRawUnsafe(`
    SELECT relname AS table_name, n_live_tup AS rows
    FROM pg_stat_user_tables
    WHERE schemaname IN ('public','private');
  `);
  const rowsOf = (table) =>
    rowCounts.find((r) => r.table_name === table)?.rows ?? 0;

  console.log("== FOREIGN KEYS WITHOUT A LEADING INDEX ==\n");
  let missing = 0;
  for (const fk of fks) {
    const ok = covered(fk.table_name, fk.column_name);
    if (!ok) missing++;
    console.log(
      `${ok ? "OK     " : "MISSING"} ${fk.schema}.${fk.table_name}.${fk.column_name}  ${fk.definition}`
    );
  }
  console.log(`\nmissing: ${missing}`);

  console.log("\n== INDEXES (scan = 0 means the planner never picked it yet) ==\n");
  for (const ix of indexes) {
    console.log(
      `${String(ix.scans).padStart(6)} scans | ${String(rowsOf(ix.table_name)).padStart(6)} rows | ${ix.schema}.${ix.table_name}.${ix.index_name}`
    );
  }

  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); process.exit(1); });
