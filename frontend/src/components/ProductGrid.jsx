function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

export default function ProductGrid({
  products,
  wishlist,
  onAddToCart,
  onViewProduct,
  onToggleWishlist,
  busy
}) {
  return (
    <section className="product-grid">
      {products.map((product) => (
        <article key={product.product_id} className="product-card">
          <div className="product-card__visual">
            {product.image_url ? <img src={product.image_url} alt={product.name} className="product-image" /> : null}
            <span className="product-badge">
              {Number(product.avg_rating) >= 4.5 ? 'Top Rated' : 'Trending'}
            </span>
            <strong>{product.brand}</strong>
          </div>
          <div className="product-card__body">
            <div className="product-card__tags">
              <span>{product.category_name}</span>
              <span>Assured seller</span>
            </div>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="price-block">
              <strong>{formatCurrency(product.price)}</strong>
              <span className="strike-price">
                {formatCurrency(Number(product.price) * 1.18)}
              </span>
              <span className="discount-tag">18% off</span>
            </div>
            <div className="product-meta">
              <span>{product.avg_rating} stars</span>
              <span>{product.review_count} reviews</span>
              <span>{product.stock_qty} left</span>
            </div>
            <div className="delivery-note">
              <strong>Free delivery</strong>
              <span>by tomorrow with PulsePass</span>
            </div>
            <div className="product-actions">
              <button
                className="primary-button"
                onClick={() => onAddToCart(product.product_id, 1)}
                disabled={busy || Number(product.stock_qty) === 0}
              >
                {Number(product.stock_qty) === 0 ? 'Out of stock' : 'Add to cart'}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => onViewProduct(product.product_id)}
              >
                View details
              </button>
            </div>
            <button
              className="wishlist-link"
              type="button"
              onClick={() => onToggleWishlist(product.product_id)}
            >
              {wishlist.some((item) => item.product_id === product.product_id)
                ? 'Remove from wishlist'
                : 'Save to wishlist'}
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
