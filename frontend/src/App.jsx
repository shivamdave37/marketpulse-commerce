import { useState } from 'react';
import CartPanel from './components/CartPanel.jsx';
import CategoryRail from './components/CategoryRail.jsx';
import Header from './components/Header.jsx';
import InsightsPanel from './components/InsightsPanel.jsx';
import OrderTimeline from './components/OrderTimeline.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import { useStorefront } from './hooks/useStorefront.js';

export default function App() {
  const {
    catalog,
    cart,
    orders,
    dashboard,
    filters,
    loading,
    busy,
    error,
    updateFilters,
    addToCart,
    removeFromCart,
    placeCheckout
  } = useStorefront();
  const [checkoutMessage, setCheckoutMessage] = useState('');

  async function handleCheckout() {
    try {
      const result = await placeCheckout('card');
      setCheckoutMessage(`Order placed successfully. Order ID: ${result.orderId}`);
    } catch (_error) {
      setCheckoutMessage('');
    }
  }

  return (
    <main className="page-shell">
      <Header
        filters={filters}
        onSearchChange={(value) => updateFilters({ search: value })}
        onSortChange={(value) => updateFilters({ sort: value })}
      />

      <InsightsPanel
        stats={dashboard.stats}
        topCategories={dashboard.topCategories}
        recentOrders={dashboard.recentOrders}
      />

      <CategoryRail
        categories={catalog.categories}
        activeCategory={filters.category}
        onSelect={(value) => updateFilters({ category: value })}
      />

      {error ? <div className="banner banner--error">{error}</div> : null}
      {checkoutMessage ? <div className="banner banner--success">{checkoutMessage}</div> : null}

      <section className="content-grid">
        <div className="content-main">
          <div className="section-head">
            <div>
              <span className="eyebrow">Catalog</span>
              <h2>{loading ? 'Loading products...' : `${catalog.products.length} products live`}</h2>
            </div>
            <div className="catalog-stats">
              <span>{catalog.stats.total_products || 0} listed</span>
              <span>{catalog.stats.total_stock || 0} units in stock</span>
            </div>
          </div>

          <ProductGrid products={catalog.products} onAddToCart={addToCart} busy={busy} />
          <OrderTimeline orders={orders} />
        </div>

        <CartPanel
          cart={cart}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
          busy={busy}
        />
      </section>
    </main>
  );
}

