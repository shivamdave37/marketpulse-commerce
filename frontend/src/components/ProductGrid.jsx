function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

export default function ProductGrid({ products, onAddToCart, busy }) {
  return (
    <section className="product-grid">
      {products.map((product) => (
        <article key={product.product_id} className="product-card">
          <div className="product-card__visual">
            <span>{product.category_name}</span>
            <strong>{product.brand}</strong>
          </div>
          <div className="product-card__body">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="product-meta">
              <span>{formatCurrency(product.price)}</span>
              <span>{product.avg_rating} / 5</span>
              <span>{product.stock_qty} left</span>
            </div>
            <button
              className="primary-button"
              onClick={() => onAddToCart(product.product_id, 1)}
              disabled={busy || Number(product.stock_qty) === 0}
            >
              {Number(product.stock_qty) === 0 ? 'Out of stock' : 'Add to cart'}
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

