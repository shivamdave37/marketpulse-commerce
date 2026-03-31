import { pool } from '../db/pool.js';
import { invalidateCache } from './cacheService.js';

export async function getAddresses(userId) {
  const { rows } = await pool.query(
    `
      SELECT
        address_id,
        label,
        recipient_name,
        phone,
        line1,
        city,
        state,
        postal_code,
        country,
        is_default
      FROM user_addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC;
    `,
    [userId]
  );

  return rows;
}

export async function getWishlist(userId) {
  const { rows } = await pool.query(
    `
      SELECT
        w.wishlist_id,
        p.product_id,
        p.name,
        p.brand,
        p.price,
        p.stock_qty,
        c.name AS category_name
      FROM wishlist_items w
      JOIN products p ON p.product_id = w.product_id
      LEFT JOIN categories c ON c.category_id = p.category_id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC;
    `,
    [userId]
  );

  return rows;
}

export async function toggleWishlist(userId, productId) {
  const existing = await pool.query(
    `SELECT wishlist_id FROM wishlist_items WHERE user_id = $1 AND product_id = $2`,
    [userId, productId]
  );

  if (existing.rows.length) {
    await pool.query(`DELETE FROM wishlist_items WHERE wishlist_id = $1`, [
      existing.rows[0].wishlist_id
    ]);
  } else {
    await pool.query(
      `INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2)`,
      [userId, productId]
    );
  }

  invalidateCache('catalog:');
  invalidateCache(`product:`);
  return getWishlist(userId);
}
