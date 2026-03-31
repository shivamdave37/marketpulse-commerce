export default function Header({
  profiles,
  currentUserId,
  filters,
  cart,
  orders,
  wishlist,
  onProfileChange,
  onSearchChange,
  onSortChange
}) {
  return (
    <header className="market-header">
      <div className="top-strip">
        <span>PulsePass benefits</span>
        <span>Free delivery over Rs. 499</span>
        <span>Easy returns</span>
        <span>Secure checkout</span>
      </div>

      <div className="nav-shell">
        <div className="brand-lockup">
          <div className="brand-mark">MP</div>
          <div>
            <strong>MarketPulse</strong>
            <p>India's everyday shopping lane</p>
          </div>
        </div>

        <div className="delivery-pill">
          <span>Deliver to</span>
          <strong>Bengaluru 560001</strong>
        </div>

        <label className="profile-switch">
          <span>Profile</span>
          <select value={currentUserId} onChange={(event) => onProfileChange(event.target.value)}>
            {profiles.map((profile) => (
              <option key={profile.user_id} value={profile.user_id}>
                {profile.full_name}
              </option>
            ))}
          </select>
        </label>

        <div className="search-cluster">
          <label className="search-field">
            <span>Search everything</span>
            <input
              value={filters.search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search mobiles, fashion, kitchen, audio..."
            />
          </label>

          <label className="sort-field">
            <span>Sort</span>
            <select value={filters.sort} onChange={(event) => onSortChange(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>

        <div className="nav-actions">
          <div className="nav-card">
            <span>Orders</span>
            <strong>{orders.length}</strong>
          </div>
          <div className="nav-card">
            <span>Wishlist</span>
            <strong>{wishlist.length}</strong>
          </div>
          <div className="nav-card nav-card--accent">
            <span>Cart</span>
            <strong>{cart.summary.quantity}</strong>
          </div>
        </div>
      </div>
    </header>
  );
}
