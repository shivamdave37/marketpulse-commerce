function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

export default function CartPanel({
  cart,
  addresses,
  coupons,
  couponCode,
  addressDraft,
  selectedAddressId,
  selectedPaymentMethod,
  onSelectAddress,
  onSelectPayment,
  onCouponChange,
  onAddressDraftChange,
  onAddressSave,
  onAddressDelete,
  onQuantityChange,
  onRemove,
  onCheckout,
  busy
}) {
  return (
    <aside className="panel">
      <div className="panel__head">
        <h2>Your Cart</h2>
        <span>{cart.summary.quantity} items</span>
      </div>
      <div className="checkout-preferences">
        <label className="field">
          <span>Delivery address</span>
          <select value={selectedAddressId} onChange={(event) => onSelectAddress(event.target.value)}>
            {addresses.map((address) => (
              <option key={address.address_id} value={address.address_id}>
                {address.label} - {address.city}
              </option>
            ))}
          </select>
        </label>

        <div className="address-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              onAddressDraftChange({
                addressId: '',
                label: 'Home',
                recipientName: '',
                phone: '',
                line1: '',
                city: '',
                state: '',
                postalCode: '',
                country: 'India',
                isDefault: addresses.length === 0
              })
            }
          >
            Add address
          </button>
          {selectedAddressId ? (
            <button className="secondary-button" type="button" onClick={() => onAddressDelete(selectedAddressId)}>
              Delete selected
            </button>
          ) : null}
        </div>

        {addressDraft ? (
          <div className="address-form">
            <input placeholder="Label" value={addressDraft.label} onChange={(event) => onAddressDraftChange({ ...addressDraft, label: event.target.value })} />
            <input placeholder="Recipient name" value={addressDraft.recipientName} onChange={(event) => onAddressDraftChange({ ...addressDraft, recipientName: event.target.value })} />
            <input placeholder="Phone" value={addressDraft.phone} onChange={(event) => onAddressDraftChange({ ...addressDraft, phone: event.target.value })} />
            <input placeholder="Address line" value={addressDraft.line1} onChange={(event) => onAddressDraftChange({ ...addressDraft, line1: event.target.value })} />
            <input placeholder="City" value={addressDraft.city} onChange={(event) => onAddressDraftChange({ ...addressDraft, city: event.target.value })} />
            <input placeholder="State" value={addressDraft.state} onChange={(event) => onAddressDraftChange({ ...addressDraft, state: event.target.value })} />
            <input placeholder="Postal code" value={addressDraft.postalCode} onChange={(event) => onAddressDraftChange({ ...addressDraft, postalCode: event.target.value })} />
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={Boolean(addressDraft.isDefault)}
                onChange={(event) => onAddressDraftChange({ ...addressDraft, isDefault: event.target.checked })}
              />
              <span>Set as default</span>
            </label>
            <button className="primary-button" type="button" onClick={() => onAddressSave(addressDraft)}>
              Save address
            </button>
          </div>
        ) : null}

        <div className="payment-choice">
          <span>Payment</span>
          <div className="payment-choice__row">
            {['card', 'upi', 'wallet', 'cod'].map((method) => (
              <button
                key={method}
                type="button"
                className={selectedPaymentMethod === method ? 'chip chip--active' : 'chip'}
                onClick={() => onSelectPayment(method)}
              >
                <strong>{method.toUpperCase()}</strong>
                <span>Demo</span>
              </button>
            ))}
          </div>
        </div>

        <div className="coupon-panel">
          <label className="field">
            <span>Coupon</span>
            <input
              placeholder="SAVE10 / FREESHIP / WELCOME250"
              value={couponCode}
              onChange={(event) => onCouponChange(event.target.value.toUpperCase())}
            />
          </label>
          <div className="coupon-list">
            {coupons.map((coupon) => (
              <button key={coupon.code} type="button" className="chip" onClick={() => onCouponChange(coupon.code)}>
                <strong>{coupon.code}</strong>
                <span>{coupon.type}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="cart-benefits">
        <span>Secure checkout</span>
        <span>Delivery updates</span>
        <span>COD available</span>
      </div>
      <div className="cart-list">
        {cart.items.length ? (
          cart.items.map((item) => (
            <div key={item.cart_id} className="cart-item">
              <div>
                <strong>{item.name}</strong>
                <p>{item.brand}</p>
                <div className="qty-controls">
                  <button type="button" onClick={() => onQuantityChange(item.product_id, item.quantity - 1)} disabled={busy}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => onQuantityChange(item.product_id, item.quantity + 1)} disabled={busy}>+</button>
                </div>
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
        <div>
          <span>Shipping</span>
          <strong>{formatCurrency(cart.summary.shippingFee || 0)}</strong>
        </div>
        <div>
          <span>Discount</span>
          <strong>{formatCurrency(cart.summary.discountAmount || 0)}</strong>
        </div>
        <button className="primary-button" onClick={onCheckout} disabled={busy || !cart.items.length}>
          Pay {formatCurrency(cart.summary.totalAmount || cart.summary.subtotal || 0)}
        </button>
      </div>
    </aside>
  );
}
