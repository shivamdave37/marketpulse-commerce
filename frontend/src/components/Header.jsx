export default function Header({
  filters,
  onSearchChange,
  onSortChange
}) {
  return (
    <header className="hero">
      <div className="hero__copy">
        <span className="eyebrow">Realtime commerce search</span>
        <h1>MarketPulse</h1>
        <p>
          A high-speed storefront with full-text product discovery, transactional
          checkout, and marketplace-style browsing.
        </p>
      </div>
      <div className="hero__panel">
        <label className="field">
          <span>Search products</span>
          <input
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search phone, laptop, earbuds..."
          />
        </label>
        <label className="field">
          <span>Sort by</span>
          <select value={filters.sort} onChange={(event) => onSortChange(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
          </select>
        </label>
      </div>
    </header>
  );
}

