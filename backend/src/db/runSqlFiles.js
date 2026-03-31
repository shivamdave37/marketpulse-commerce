import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';
import { migrateLegacyOrders } from './migrateLegacyOrders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runFile(filePath) {
  const sql = await fs.readFile(filePath, 'utf8');
  await pool.query(sql);
}

async function rebuildAnalyticsView(client) {
  await client.query(`
    DROP MATERIALIZED VIEW IF EXISTS mv_category_sales_summary;

    CREATE MATERIALIZED VIEW mv_category_sales_summary AS
    SELECT
      c.category_id,
      c.name AS category_name,
      COUNT(DISTINCT o.order_id) AS total_orders,
      COALESCE(SUM(CASE WHEN o.order_id IS NOT NULL THEN oi.qty ELSE 0 END), 0) AS units_sold,
      COALESCE(SUM(CASE WHEN o.order_id IS NOT NULL THEN oi.qty * oi.unit_price ELSE 0 END), 0)::NUMERIC(12, 2) AS gross_sales
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.category_id
    LEFT JOIN order_items oi ON oi.product_id = p.product_id
    LEFT JOIN orders o
      ON o.order_id = oi.order_id
      AND o.placed_at = oi.order_placed_at
      AND o.status IN ('paid', 'shipped', 'delivered')
    GROUP BY c.category_id, c.name;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_category_sales_summary_category
    ON mv_category_sales_summary(category_id);
  `);
}

async function main() {
  const migrationPath = path.resolve(__dirname, '../../../database/migrations/001_init.sql');
  const seedPath = path.resolve(__dirname, '../../../database/seeds/001_seed.sql');

  try {
    await runFile(migrationPath);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await migrateLegacyOrders(client);
      await rebuildAnalyticsView(client);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    await runFile(seedPath);
    console.log('Database migration and seed completed.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Failed to run SQL files:', error.message);
  process.exit(1);
});
