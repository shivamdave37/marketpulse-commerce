function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString();
}

export default function ProductDetailView({
  detail,
  wishlist,
  busy,
  onBack,
  onAddToCart,
  onToggleWishlist,
  onSelectRelated
}) {
  const { product, reviews, relatedProducts } = detail;
  const inWishlist = wishlist.some((item) => item.product_id === product.product_id);

  return (
    <section className="detail-page">
      <button className="back-link" type="button" onClick={onBack}>
        Back to shopping
      </button>

      <div className="detail-hero">
        <div className="detail-gallery">
          <div className="detail-image-card">
            {product.image_url ? <img src={product.image_url} alt={product.name} className="detail-image" /> : null}
            <span className="detail-badge">MarketPulse Assured</span>
            <strong>{product.brand}</strong>
            <p>{product.category_name}</p>
          </div>
          <div className="detail-thumbs">
            <span>Fast delivery</span>
            <span>Easy returns</span>
            <span>Secure checkout</span>
          </div>
        </div>

        <div className="detail-summary">
          <span className="eyebrow">Product details</span>
          <h1>{product.name}</h1>
          <p className="detail-copy">{product.description}</p>

          <div className="detail-rating-row">
            <strong>{product.avg_rating} stars</strong>
            <span>{product.review_count} ratings</span>
            <span>{product.stock_qty} in stock</span>
          </div>

          <div className="detail-price-block">
            <strong>{formatCurrency(product.price)}</strong>
            <span className="strike-price">{formatCurrency(Number(product.price) * 1.18)}</span>
            <span className="discount-tag">18% off</span>
          </div>

          <div className="detail-offers">
            <div className="offer-card">
              <strong>Bank Offer</strong>
              <p>Instant discount on select cards and wallets.</p>
            </div>
            <div className="offer-card">
              <strong>Delivery</strong>
              <p>Express-ready shipping with order tracking.</p>
            </div>
            <div className="offer-card">
              <strong>Warranty</strong>
              <p>Brand-backed purchase confidence for supported items.</p>
            </div>
          </div>

          <div className="detail-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => onAddToCart(product.product_id, 1)}
              disabled={busy || Number(product.stock_qty) === 0}
            >
              {Number(product.stock_qty) === 0 ? 'Out of stock' : 'Add to cart'}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => onAddToCart(product.product_id, 1)}
              disabled={busy || Number(product.stock_qty) === 0}
            >
              Buy now
            </button>
            <button className="wishlist-link" type="button" onClick={() => onToggleWishlist(product.product_id)}>
              {inWishlist ? 'Saved in wishlist' : 'Add to wishlist'}
            </button>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <article className="detail-panel">
          <h2>Product Highlights</h2>
          <div className="spec-list">
            <div>
              <span>Brand</span>
              <strong>{product.brand}</strong>
            </div>
            <div>
              <span>Category</span>
              <strong>{product.category_name}</strong>
            </div>
            <div>
              <span>Availability</span>
              <strong>{product.stock_qty > 0 ? 'Ready to ship' : 'Out of stock'}</strong>
            </div>
            <div>
              <span>Added</span>
              <strong>{formatDate(product.created_at)}</strong>
            </div>
          </div>
        </article>

        <article className="detail-panel">
          <h2>Customer Reviews</h2>
          {reviews.length ? (
            <div className="review-list">
              {reviews.map((review) => (
                <div key={review.review_id} className="review-card">
                  <div className="review-head">
                    <strong>{review.full_name}</strong>
                    <span>{review.rating} / 5</span>
                  </div>
                  <p>{review.body}</p>
                  <small>{formatDate(review.created_at)}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No reviews yet for this product.</p>
          )}
        </article>
      </div>

      <article className="detail-panel">
        <div className="panel__head">
          <h2>Related Products</h2>
          <span>{relatedProducts.length} suggestions</span>
        </div>
        <div className="related-grid">
          {relatedProducts.map((item) => (
            <button
              key={item.product_id}
              type="button"
              className="related-card"
              onClick={() => onSelectRelated(item.product_id)}
            >
              <span>{item.category_name}</span>
              <strong>{item.name}</strong>
              <p>{item.brand}</p>
              <div className="related-meta">
                <span>{formatCurrency(item.price)}</span>
                <span>{item.avg_rating} stars</span>
              </div>
            </button>
          ))}
        </div>
      </article>
    </section>
  );
}
