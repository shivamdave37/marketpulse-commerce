function monthStart(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date, months) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

function formatTimestamp(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

async function ensureMonthlyPartitions(client, monthsBack = 2, monthsForward = 4) {
  const now = new Date();
  const base = monthStart(now);

  for (let offset = -monthsBack; offset <= monthsForward; offset += 1) {
    const start = addMonths(base, offset);
    const end = addMonths(base, offset + 1);
    const partitionName = `orders_${start.getUTCFullYear()}_${String(
      start.getUTCMonth() + 1
    ).padStart(2, '0')}`;

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${partitionName} PARTITION OF orders
      FOR VALUES FROM ('${formatTimestamp(start)}') TO ('${formatTimestamp(end)}');
    `);
  }
}

async function isOrdersPartitioned(client) {
  const { rows } = await client.query(`
    SELECT EXISTS (
      SELECT 1
      FROM pg_partitioned_table pt
      JOIN pg_class c ON c.oid = pt.partrelid
      WHERE c.relname = 'orders'
    ) AS is_partitioned;
  `);

  return rows[0]?.is_partitioned;
}

export async function migrateLegacyOrders(client) {
  const {
    rows: [{ has_orders_table }]
  } = await client.query(`
    SELECT to_regclass('public.orders') IS NOT NULL AS has_orders_table;
  `);

  if (!has_orders_table) {
    return;
  }

  if (await isOrdersPartitioned(client)) {
    await ensureMonthlyPartitions(client);
    return;
  }

  await client.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(40);
    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS fk_order_items_order;
    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_order_placed_at_product_id_key;
    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_product_unique;
    ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_order;
    ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_order_id_fkey;
    ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_order_id_key;
    ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_order_id_order_placed_at_key;
    ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_order_pair_unique;
    ALTER TABLE order_items ADD COLUMN IF NOT EXISTS order_placed_at TIMESTAMP;
    ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_placed_at TIMESTAMP;
  `);

  await client.query(`
    UPDATE order_items oi
    SET order_placed_at = o.placed_at
    FROM orders o
    WHERE oi.order_id = o.order_id
      AND oi.order_placed_at IS NULL;

    UPDATE payments p
    SET order_placed_at = o.placed_at
    FROM orders o
    WHERE p.order_id = o.order_id
      AND p.order_placed_at IS NULL;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS orders_partitioned (
      order_id UUID NOT NULL DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users_account(user_id) ON DELETE CASCADE,
      status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'returned')),
      total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
      shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
      discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
      coupon_code VARCHAR(40),
      shipping_address JSONB,
      placed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (order_id, placed_at)
    ) PARTITION BY RANGE (placed_at);

    CREATE TABLE IF NOT EXISTS orders_partitioned_default PARTITION OF orders_partitioned DEFAULT;
  `);

  const {
    rows: [{ min_placed_at, max_placed_at }]
  } = await client.query(`
    SELECT MIN(placed_at) AS min_placed_at, MAX(placed_at) AS max_placed_at
    FROM orders;
  `);

  const minDate = min_placed_at ? monthStart(new Date(min_placed_at)) : monthStart(new Date());
  const maxDate = max_placed_at ? monthStart(new Date(max_placed_at)) : monthStart(new Date());

  for (
    let current = new Date(minDate);
    current <= addMonths(maxDate, 1);
    current = addMonths(current, 1)
  ) {
    const end = addMonths(current, 1);
    const partitionName = `orders_partitioned_${current.getUTCFullYear()}_${String(
      current.getUTCMonth() + 1
    ).padStart(2, '0')}`;

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${partitionName} PARTITION OF orders_partitioned
      FOR VALUES FROM ('${formatTimestamp(current)}') TO ('${formatTimestamp(end)}');
    `);
  }

  await client.query(`
    INSERT INTO orders_partitioned (order_id, user_id, status, total_amount, shipping_fee, discount_amount, coupon_code, shipping_address, placed_at)
    SELECT order_id, user_id, status, total_amount, shipping_fee, discount_amount, coupon_code, shipping_address, placed_at
    FROM orders
    ON CONFLICT (order_id, placed_at) DO NOTHING;
  `);

  await client.query(`
    DROP TABLE IF EXISTS orders_legacy_backup CASCADE;
    ALTER TABLE orders RENAME TO orders_legacy_backup;
    ALTER TABLE orders_partitioned RENAME TO orders;

    ALTER TABLE order_items ALTER COLUMN order_placed_at SET NOT NULL;
    ALTER TABLE payments ALTER COLUMN order_placed_at SET NOT NULL;

    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_product_id_key;
    ALTER TABLE order_items ADD CONSTRAINT order_items_order_product_unique
      UNIQUE (order_id, order_placed_at, product_id);

    ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order
      FOREIGN KEY (order_id, order_placed_at)
      REFERENCES orders(order_id, placed_at)
      ON DELETE CASCADE;

    ALTER TABLE payments ADD CONSTRAINT payments_order_pair_unique
      UNIQUE (order_id, order_placed_at);

    ALTER TABLE payments ADD CONSTRAINT fk_payments_order
      FOREIGN KEY (order_id, order_placed_at)
      REFERENCES orders(order_id, placed_at)
      ON DELETE CASCADE;
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, placed_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_pending_partial ON orders(placed_at DESC) WHERE status = 'pending';
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id, order_placed_at);
  `);

  await ensureMonthlyPartitions(client);
}
