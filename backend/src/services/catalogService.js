import { pool } from '../db/pool.js';
import { withCache } from './cacheService.js';

export async function getHomeCatalog({ search = '', category, sort = 'featured' }) {
  const normalizedSearch = search.trim();
  const values = [normalizedSearch];
  const filters = [];

  if (normalizedSearch) {
    values.push(`%${normalizedSearch.toLowerCase()}%`);
    filters.push(
      `(
        p.search_vector @@ websearch_to_tsquery('english', $1)
        OR LOWER(p.name) LIKE $2
        OR LOWER(COALESCE(p.brand, '')) LIKE $2
        OR LOWER(COALESCE(p.description, '')) LIKE $2
      )`
    );
  }

  if (category) {
    values.push(category);
    filters.push(`c.slug = $${values.length}`);
  }

  const orderClause = {
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    newest: 'p.created_at DESC',
    rating: 'avg_rating DESC NULLS LAST',
    featured: 'review_count DESC, p.created_at DESC'
  }[sort] || 'review_count DESC, p.created_at DESC';

  const query = `
    SELECT
      p.product_id,
      p.name,
      p.description,
      p.brand,
      p.image_url,
      p.price,
      p.stock_qty,
      p.created_at,
      c.category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
      COUNT(r.review_id)::int AS review_count,
      CASE
        WHEN $1::text <> '' THEN
          ts_rank(p.search_vector, websearch_to_tsquery('english', $1)) +
          CASE
            WHEN LOWER(p.name) LIKE $2 THEN 0.8
            WHEN LOWER(COALESCE(p.brand, '')) LIKE $2 THEN 0.5
            WHEN LOWER(COALESCE(p.description, '')) LIKE $2 THEN 0.2
            ELSE 0
          END
        ELSE 0
      END AS search_rank
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    LEFT JOIN reviews r ON r.product_id = p.product_id
    ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
    GROUP BY p.product_id, c.category_id
    ORDER BY ${normalizedSearch ? 'search_rank DESC,' : ''} ${orderClause}
    LIMIT 24;
  `;

  const cacheKey = `catalog:${normalizedSearch}:${category || 'all'}:${sort}`;
  return withCache(cacheKey, 20_000, async () => {
    const { rows } = await pool.query(query, values);
    return rows;
  });
}

export async function getCategories() {
  return withCache('catalog:categories', 60_000, async () => {
    const { rows } = await pool.query(`
      SELECT
        c.category_id,
        c.name,
        c.slug,
        c.parent_id,
        COUNT(p.product_id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.category_id
      GROUP BY c.category_id
      ORDER BY c.parent_id NULLS FIRST, c.name;
    `);

    return rows;
  });
}

export async function getFeaturedStats() {
  return withCache('catalog:stats', 30_000, async () => {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)::int AS total_products,
        COALESCE(SUM(stock_qty), 0)::int AS total_stock,
        ROUND(AVG(price)::numeric, 2) AS avg_price
      FROM products;
    `);

    return rows[0];
  });
}

export async function getProductDetail(productId) {
  return withCache(`product:${productId}`, 20_000, async () => {
    const productResult = await pool.query(
      `
        SELECT
          p.product_id,
          p.name,
          p.description,
          p.brand,
          p.image_url,
          p.price,
          p.stock_qty,
          p.created_at,
          c.category_id,
          c.name AS category_name,
          c.slug AS category_slug,
          COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
          COUNT(r.review_id)::int AS review_count
        FROM products p
        LEFT JOIN categories c ON c.category_id = p.category_id
        LEFT JOIN reviews r ON r.product_id = p.product_id
        WHERE p.product_id = $1
        GROUP BY p.product_id, c.category_id;
      `,
      [productId]
    );

    if (!productResult.rows.length) {
      throw new Error('Product not found.');
    }

    const reviewsResult = await pool.query(
      `
        SELECT
          r.review_id,
          r.rating,
          r.body,
          r.created_at,
          u.full_name
        FROM reviews r
        JOIN users_account u ON u.user_id = r.user_id
        WHERE r.product_id = $1
        ORDER BY r.created_at DESC;
      `,
      [productId]
    );

    const relatedResult = await pool.query(
      `
        SELECT
          p.product_id,
          p.name,
          p.brand,
          p.image_url,
          p.price,
          p.stock_qty,
          c.name AS category_name,
          COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
          COUNT(r.review_id)::int AS review_count
        FROM products p
        LEFT JOIN categories c ON c.category_id = p.category_id
        LEFT JOIN reviews r ON r.product_id = p.product_id
        WHERE p.product_id <> $1
          AND (
            p.category_id = (SELECT category_id FROM products WHERE product_id = $1)
            OR LOWER(COALESCE(p.brand, '')) = LOWER(COALESCE((SELECT brand FROM products WHERE product_id = $1), ''))
          )
        GROUP BY p.product_id, c.name
        ORDER BY avg_rating DESC NULLS LAST, p.created_at DESC
        LIMIT 4;
      `,
      [productId]
    );

    return {
      product: productResult.rows[0],
      reviews: reviewsResult.rows,
      relatedProducts: relatedResult.rows
    };
  });
}
