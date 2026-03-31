import { pool } from '../db/pool.js';

export async function listOrders(userId) {
  const { rows } = await pool.query(
    `
      SELECT
        o.order_id,
        o.status,
        o.total_amount,
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
      LEFT JOIN payments p ON p.order_id = o.order_id
      LEFT JOIN order_items oi ON oi.order_id = o.order_id
      LEFT JOIN products pr ON pr.product_id = oi.product_id
      WHERE o.user_id = $1
      GROUP BY o.order_id, p.payment_id
      ORDER BY o.placed_at DESC;
    `,
    [userId]
  );

  return rows;
}

export async function checkoutCart(userId, paymentMethod = 'card') {
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

    for (const item of cartResult.rows) {
      if (Number(item.stock_qty) < Number(item.quantity)) {
        throw new Error(`Insufficient stock for ${item.name}.`);
      }
    }

    const orderInsert = await client.query(
      `
        INSERT INTO orders (user_id, status, total_amount)
        VALUES ($1, 'paid', 0)
        RETURNING order_id;
      `,
      [userId]
    );

    const orderId = orderInsert.rows[0].order_id;
    let totalAmount = 0;

    for (const item of cartResult.rows) {
      totalAmount += Number(item.price) * Number(item.quantity);

      await client.query(
        `
          INSERT INTO order_items (order_id, product_id, qty, unit_price)
          VALUES ($1, $2, $3, $4);
        `,
        [orderId, item.product_id, item.quantity, item.price]
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
        UPDATE orders
        SET total_amount = $1
        WHERE order_id = $2;
      `,
      [totalAmount, orderId]
    );

    await client.query(
      `
        INSERT INTO payments (order_id, method, status, paid_at)
        VALUES ($1, $2, 'paid', NOW());
      `,
      [orderId, paymentMethod]
    );

    await client.query(`DELETE FROM cart WHERE user_id = $1`, [userId]);
    await client.query(`SELECT refresh_category_sales_summary()`);
    await client.query('COMMIT');

    return {
      orderId,
      totalAmount: Number(totalAmount.toFixed(2)),
      orders: await listOrders(userId)
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

