function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);
}

export default function OrderTimeline({ orders }) {
  return (
    <section className="panel">
      <div className="panel__head">
        <h2>Your Orders</h2>
        <span>{orders.length} orders</span>
      </div>
      {orders.length ? (
        <div className="order-list">
          {orders.map((order) => (
            <article key={order.order_id} className="order-card">
              <div className="order-card__head">
                <strong>{order.status}</strong>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
              <p>{new Date(order.placed_at).toLocaleString()}</p>
              <div className="order-chip-row">
                <span className="order-chip">Payment: {order.payment_method || 'pending'}</span>
                <span className="order-chip">Status: {order.payment_status || order.status}</span>
              </div>
              <div className="order-items">
                {order.items.map((item) => (
                  <span key={`${order.order_id}-${item.productId}`}>
                    {item.name} x {item.qty}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-state">No orders yet. Your checkout history will appear here.</p>
      )}
    </section>
  );
}
