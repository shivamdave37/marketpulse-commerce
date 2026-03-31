function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);
}

export default function InsightsPanel({ stats, topCategories, recentOrders }) {
  return (
    <section className="dashboard">
      <div className="metric-card">
        <span>Orders</span>
        <strong>{stats.total_orders || 0}</strong>
      </div>
      <div className="metric-card">
        <span>Revenue</span>
        <strong>{formatCurrency(stats.gross_revenue)}</strong>
      </div>
      <div className="metric-card">
        <span>Pending</span>
        <strong>{stats.pending_orders || 0}</strong>
      </div>
      <div className="insight-card">
        <h3>Top Categories</h3>
        {topCategories.map((item) => (
          <div key={item.category_id} className="insight-row">
            <span>{item.category_name}</span>
            <strong>{formatCurrency(item.gross_sales)}</strong>
          </div>
        ))}
      </div>
      <div className="insight-card">
        <h3>Recent Orders</h3>
        {recentOrders.map((order) => (
          <div key={order.order_id} className="insight-row">
            <span>{order.full_name}</span>
            <strong>{formatCurrency(order.total_amount)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

