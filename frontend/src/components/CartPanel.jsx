function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

export default function CartPanel({ cart, onRemove, onCheckout, busy }) {
  return (
    <aside className="panel">
      <div className="panel__head">
        <h2>Your Cart</h2>
        <span>{cart.summary.quantity} items</span>
      </div>
      <div className="cart-list">
        {cart.items.length ? (
          cart.items.map((item) => (
            <div key={item.cart_id} className="cart-item">
              <div>
                <strong>{item.name}</strong>
                <p>{item.brand}</p>
              </div>
              <div>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
                <button onClick={() => onRemove(item.product_id)} disabled={busy}>
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-state">Your cart is waiting for its first product.</p>
        )}
      </div>
      <div className="checkout-box">
        <div>
          <span>Subtotal</span>
          <strong>{formatCurrency(cart.summary.subtotal || 0)}</strong>
        </div>
        <button className="primary-button" onClick={onCheckout} disabled={busy || !cart.items.length}>
          Checkout now
        </button>
      </div>
    </aside>
  );
}

