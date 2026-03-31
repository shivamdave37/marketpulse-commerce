import { useState } from 'react';
import CartPanel from './components/CartPanel.jsx';
import CategoryRail from './components/CategoryRail.jsx';
import Header from './components/Header.jsx';
import InsightsPanel from './components/InsightsPanel.jsx';
import OrderTimeline from './components/OrderTimeline.jsx';
import ProductDetailView from './components/ProductDetailView.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import PromoShowcase from './components/PromoShowcase.jsx';
import ServiceHighlights from './components/ServiceHighlights.jsx';
import { useStorefront } from './hooks/useStorefront.js';

export default function App() {
  const {
    profiles,
    currentUserId,
    catalog,
    cart,
    orders,
    dashboard,
    productDetail,
    addresses,
    wishlist,
    coupons,
    couponCode,
    addressDraft,
    selectedAddressId,
    selectedPaymentMethod,
    filters,
    loading,
    busy,
    error,
    updateFilters,
    addToCart,
    removeFromCart,
    placeCheckout,
    openProduct,
    closeProduct,
    toggleWishlist,
    saveAddress,
    deleteAddress,
    refreshQuote,
    cancelOrder,
    returnOrder,
    setSelectedAddressId,
    setSelectedPaymentMethod,
    setCurrentUserId,
    setAddressDraft
  } = useStorefront();
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const featuredProduct = catalog.products[0];

  async function handleCheckout() {
    try {
      const result = await placeCheckout(selectedPaymentMethod);
      setCheckoutMessage(`Order placed successfully. Order ID: ${result.orderId}`);
    } catch (_error) {
      setCheckoutMessage('');
    }
  }

  return (
    <main className="page-shell">
      <Header
        profiles={profiles}
        currentUserId={currentUserId}
        filters={filters}
        cart={cart}
        orders={orders}
        wishlist={wishlist}
        onProfileChange={setCurrentUserId}
        onSearchChange={(value) => updateFilters({ search: value })}
        onSortChange={(value) => updateFilters({ sort: value })}
      />

      <PromoShowcase
        stats={catalog.stats}
        featuredProduct={featuredProduct}
        cart={cart}
      />

      <ServiceHighlights />

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
          {productDetail ? (
            <ProductDetailView
              detail={productDetail}
              wishlist={wishlist}
              busy={busy}
              onBack={closeProduct}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              onSelectRelated={openProduct}
            />
          ) : (
            <>
              <div className="section-head">
                <div>
                  <span className="eyebrow">Today's picks</span>
                  <h2>{loading ? 'Loading products...' : `${catalog.products.length} products ready to shop`}</h2>
                </div>
                <div className="catalog-stats">
                  <span>{catalog.stats.total_products || 0} listed</span>
                  <span>{catalog.stats.total_stock || 0} units in stock</span>
                  <span>Fast shopping layout inspired by major marketplaces</span>
                </div>
              </div>

              <ProductGrid
                products={catalog.products}
                wishlist={wishlist}
                onAddToCart={addToCart}
                onViewProduct={openProduct}
                onToggleWishlist={toggleWishlist}
                busy={busy}
              />
              <OrderTimeline
                orders={orders}
                onCancelOrder={cancelOrder}
                onReturnOrder={returnOrder}
                busy={busy}
              />
            </>
          )}
        </div>

        <CartPanel
          cart={cart}
          addresses={addresses}
          coupons={coupons}
          couponCode={couponCode}
          addressDraft={addressDraft}
          selectedAddressId={selectedAddressId}
          selectedPaymentMethod={selectedPaymentMethod}
          onSelectAddress={setSelectedAddressId}
          onSelectPayment={setSelectedPaymentMethod}
          onCouponChange={refreshQuote}
          onAddressDraftChange={setAddressDraft}
          onAddressSave={saveAddress}
          onAddressDelete={deleteAddress}
          onQuantityChange={addToCart}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
          busy={busy}
        />
      </section>
    </main>
  );
}
