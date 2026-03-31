export default function PromoShowcase({ stats, featuredProduct, cart }) {
  return (
    <section className="promo-grid">
      <article className="hero-banner">
        <div className="hero-banner__content">
          <span className="eyebrow eyebrow--dark">Mega marketplace week</span>
          <h1>Deals, delivery, and discovery like a real shopping app.</h1>
          <p>
            Shop trending categories, grab limited-time offers, and checkout fast with
            a cart experience designed for repeat buying.
          </p>
          <div className="hero-points">
            <span>{stats.total_products || 0}+ curated listings</span>
            <span>{stats.total_stock || 0}+ units ready to ship</span>
            <span>Trending across electronics, home, and fashion</span>
          </div>
        </div>
        <div className="hero-banner__spotlight">
          <span className="hero-label">Top pick</span>
          <strong>{featuredProduct?.name || 'MarketPulse Select'}</strong>
          <p>{featuredProduct?.brand || 'Trusted seller collection'}</p>
          <div className="hero-price">
            <strong>
              {featuredProduct
                ? new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0
                  }).format(featuredProduct.price)
                : 'Live now'}
            </strong>
            <span>Fast delivery available</span>
          </div>
        </div>
      </article>

      <article className="mini-promo mini-promo--gold">
        <span>Cart ready</span>
        <strong>{cart.summary.quantity} items saved for checkout</strong>
        <p>Pick up where you left off with instant checkout and stock-safe ordering.</p>
      </article>

      <article className="mini-promo mini-promo--navy">
        <span>PulsePass</span>
        <strong>Free delivery, extra savings, priority support</strong>
        <p>Amazon Prime-style trust features, adapted to your custom storefront brand.</p>
      </article>

      <article className="mini-promo mini-promo--mint">
        <span>Realtime search</span>
        <strong>Find products fast with indexed keyword search</strong>
        <p>Search, filter, and explore your catalog instantly from the same homepage.</p>
      </article>
    </section>
  );
}

