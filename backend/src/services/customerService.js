import { pool } from '../db/pool.js';
import { invalidateCache } from './cacheService.js';
import { AVAILABLE_COUPONS } from './pricingService.js';

export async function getProfiles() {
  const { rows } = await pool.query(`
    SELECT
      user_id,
      full_name,
      email,
      role
    FROM users_account
    WHERE role = 'customer'
    ORDER BY created_at ASC;
  `);

  return rows;
}

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

export async function saveAddress(userId, payload) {
  const {
    addressId,
    label,
    recipientName,
    phone,
    line1,
    city,
    state,
    postalCode,
    country = 'India',
    isDefault = false
  } = payload;

  if (isDefault) {
    await pool.query(`UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1`, [userId]);
  }

  if (addressId) {
    await pool.query(
      `
        UPDATE user_addresses
        SET
          label = $2,
          recipient_name = $3,
          phone = $4,
          line1 = $5,
          city = $6,
          state = $7,
          postal_code = $8,
          country = $9,
          is_default = $10
        WHERE address_id = $1 AND user_id = $11;
      `,
      [addressId, label, recipientName, phone, line1, city, state, postalCode, country, isDefault, userId]
    );
  } else {
    await pool.query(
      `
        INSERT INTO user_addresses (
          user_id, label, recipient_name, phone, line1, city, state, postal_code, country, is_default
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
      `,
      [userId, label, recipientName, phone, line1, city, state, postalCode, country, isDefault]
    );
  }

  return getAddresses(userId);
}

export async function deleteAddress(userId, addressId) {
  await pool.query(`DELETE FROM user_addresses WHERE user_id = $1 AND address_id = $2`, [
    userId,
    addressId
  ]);

  const remaining = await getAddresses(userId);

  if (remaining.length && !remaining.some((item) => item.is_default)) {
    await pool.query(`UPDATE user_addresses SET is_default = TRUE WHERE address_id = $1`, [
      remaining[0].address_id
    ]);
  }

  return getAddresses(userId);
}

export async function getWishlist(userId) {
  const { rows } = await pool.query(
    `
      SELECT
        w.wishlist_id,
        p.product_id,
        p.name,
        p.brand,
        p.image_url,
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

export function getCoupons() {
  return Object.values(AVAILABLE_COUPONS);
}
