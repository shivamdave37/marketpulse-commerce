import { pool } from '../db/pool.js';

export async function getCart(userId) {
  const { rows } = await pool.query(
    `
      SELECT
        c.cart_id,
        c.quantity,
        c.added_at,
        p.product_id,
        p.name,
        p.brand,
        p.price,
        p.stock_qty,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating
      FROM cart c
      JOIN products p ON p.product_id = c.product_id
      LEFT JOIN reviews r ON r.product_id = p.product_id
      WHERE c.user_id = $1
      GROUP BY c.cart_id, p.product_id
      ORDER BY c.added_at DESC;
    `,
    [userId]
  );

  const summary = rows.reduce(
    (acc, item) => {
      acc.items += 1;
      acc.quantity += Number(item.quantity);
      acc.subtotal += Number(item.quantity) * Number(item.price);
      return acc;
    },
    { items: 0, quantity: 0, subtotal: 0 }
  );

  return {
    items: rows,
    summary: {
      ...summary,
      subtotal: Number(summary.subtotal.toFixed(2))
    }
  };
}

export async function upsertCartItem(userId, productId, quantity) {
  await pool.query(
    `
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = EXCLUDED.quantity, added_at = NOW();
    `,
    [userId, productId, quantity]
  );

  return getCart(userId);
}

export async function removeCartItem(userId, productId) {
  await pool.query(`DELETE FROM cart WHERE user_id = $1 AND product_id = $2`, [
    userId,
    productId
  ]);

  return getCart(userId);
}
