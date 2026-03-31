import { pool } from '../db/pool.js';
import { invalidateCache } from './cacheService.js';
import { calculateOrderPricing } from './pricingService.js';

export async function listOrders(userId) {
  const { rows } = await pool.query(
    `
      SELECT
        o.order_id,
        o.status,
        o.total_amount,
        o.shipping_fee,
        o.discount_amount,
        o.coupon_code,
        o.shipping_address,
        o.placed_at,
        p.method AS payment_method,
        p.status AS payment_status,
        COALESCE(
          json_agg(
            json_build_object(
              'productId', pr.product_id,
              'name', pr.name,
              'qty', oi.qty,
              'unitPrice', oi.unit_price
            )
          ) FILTER (WHERE oi.item_id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM orders o
      LEFT JOIN payments p ON p.order_id = o.order_id AND p.order_placed_at = o.placed_at
      LEFT JOIN order_items oi ON oi.order_id = o.order_id AND oi.order_placed_at = o.placed_at
      LEFT JOIN products pr ON pr.product_id = oi.product_id
      WHERE o.user_id = $1
      GROUP BY o.order_id, o.placed_at, p.payment_id
      ORDER BY o.placed_at DESC;
    `,
    [userId]
  );

  return rows;
}

export async function getCheckoutQuote(userId, couponCode = '') {
  const cart = await pool.query(
    `
      SELECT
        SUM(c.quantity * p.price)::numeric(12, 2) AS subtotal
      FROM cart c
      JOIN products p ON p.product_id = c.product_id
      WHERE c.user_id = $1;
    `,
    [userId]
  );

  const subtotal = Number(cart.rows[0]?.subtotal || 0);
  return calculateOrderPricing(subtotal, couponCode);
}

export async function checkoutCart(userId, paymentMethod = 'card', addressId = null, couponCode = '') {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const cartResult = await client.query(
      `
        SELECT
          c.product_id,
          c.quantity,
          p.name,
          p.price,
          p.stock_qty
        FROM cart c
        JOIN products p ON p.product_id = c.product_id
        WHERE c.user_id = $1
        FOR UPDATE OF p;
      `,
      [userId]
    );

    if (!cartResult.rows.length) {
      throw new Error('Your cart is empty.');
    }

    const addressResult = await client.query(
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
          AND ($2::uuid IS NULL OR address_id = $2)
        ORDER BY is_default DESC, created_at DESC
        LIMIT 1;
      `,
      [userId, addressId]
    );

    if (!addressResult.rows.length) {
      throw new Error('Please select a delivery address.');
    }

    const shippingAddress = addressResult.rows[0];

    for (const item of cartResult.rows) {
      if (Number(item.stock_qty) < Number(item.quantity)) {
        throw new Error(`Insufficient stock for ${item.name}.`);
      }
    }

    const subtotal = cartResult.rows.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
    const pricing = calculateOrderPricing(subtotal, couponCode);

    const orderInsert = await client.query(
      `
        INSERT INTO orders (
          user_id, status, total_amount, shipping_fee, discount_amount, coupon_code, shipping_address, placed_at
        )
        VALUES ($1, 'paid', $2, $3, $4, $5, $6, NOW())
        RETURNING order_id, placed_at;
      `,
      [
        userId,
        pricing.totalAmount,
        pricing.shippingFee,
        pricing.discountAmount,
        pricing.appliedCoupon,
        JSON.stringify(shippingAddress)
      ]
    );

    const orderId = orderInsert.rows[0].order_id;
    const orderPlacedAt = orderInsert.rows[0].placed_at;

    for (const item of cartResult.rows) {
      await client.query(
        `
          INSERT INTO order_items (order_id, order_placed_at, product_id, qty, unit_price)
          VALUES ($1, $2, $3, $4, $5);
        `,
        [orderId, orderPlacedAt, item.product_id, item.quantity, item.price]
      );

      await client.query(
        `
          UPDATE products
          SET stock_qty = stock_qty - $1
          WHERE product_id = $2;
        `,
        [item.quantity, item.product_id]
      );
    }

    await client.query(
      `
        INSERT INTO payments (order_id, order_placed_at, method, status, paid_at)
        VALUES ($1, $2, $3, 'paid', NOW());
      `,
      [orderId, orderPlacedAt, paymentMethod]
    );

    await client.query(`DELETE FROM cart WHERE user_id = $1`, [userId]);
    await client.query(`SELECT refresh_category_sales_summary()`);
    await client.query('COMMIT');

    invalidateCache('catalog:');
    invalidateCache('dashboard:');

    return {
      orderId,
      totalAmount: pricing.totalAmount,
      orders: await listOrders(userId)
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateOrderStatus(userId, orderId, nextStatus) {
  const allowedStatuses = {
    cancelled: ['pending', 'paid'],
    returned: ['delivered']
  };

  const { rows } = await pool.query(
    `
      SELECT order_id, status
      FROM orders
      WHERE user_id = $1 AND order_id = $2
      ORDER BY placed_at DESC
      LIMIT 1;
    `,
    [userId, orderId]
  );

  if (!rows.length) {
    throw new Error('Order not found.');
  }

  if (!allowedStatuses[nextStatus]?.includes(rows[0].status)) {
    throw new Error(`Order cannot be marked as ${nextStatus}.`);
  }

  await pool.query(
    `
      UPDATE orders
      SET status = $1
      WHERE user_id = $2 AND order_id = $3;
    `,
    [nextStatus, userId, orderId]
  );

  invalidateCache('dashboard:');
  return listOrders(userId);
}
