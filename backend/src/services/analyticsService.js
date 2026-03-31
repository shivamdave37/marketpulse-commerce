import { pool } from '../db/pool.js';

export async function getDashboard() {
  const [salesStats, topCategories, recentOrders] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*)::int AS total_orders,
        COALESCE(SUM(total_amount), 0)::numeric(12, 2) AS gross_revenue,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_orders
      FROM orders;
    `),
    pool.query(`
      SELECT
        category_id,
        category_name,
        total_orders,
        units_sold,
        gross_sales
      FROM mv_category_sales_summary
      ORDER BY gross_sales DESC, units_sold DESC
      LIMIT 5;
    `),
    pool.query(`
      SELECT
        o.order_id,
        o.status,
        o.total_amount,
        o.placed_at,
        u.full_name
      FROM orders o
      JOIN users_account u ON u.user_id = o.user_id
      ORDER BY o.placed_at DESC
      LIMIT 6;
    `)
  ]);

  return {
    stats: salesStats.rows[0],
    topCategories: topCategories.rows,
    recentOrders: recentOrders.rows
  };
}

