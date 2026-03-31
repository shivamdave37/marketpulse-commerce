const API_URL = import.meta.env.VITE_API_URL || '/api';
let currentUserId =
  import.meta.env.VITE_USER_ID || '11111111-1111-1111-1111-111111111111';

export function setApiUserId(userId) {
  currentUserId = userId;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': currentUserId,
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const api = {
  getCatalog(params = {}) {
    const query = new URLSearchParams(params);
    return request(`/catalog?${query.toString()}`);
  },
  getProduct(productId) {
    return request(`/catalog/${productId}`);
  },
  getAddresses() {
    return request('/customer/addresses');
  },
  saveAddress(payload) {
    return request('/customer/addresses', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  deleteAddress(addressId) {
    return request(`/customer/addresses/${addressId}`, {
      method: 'DELETE'
    });
  },
  getProfiles() {
    return request('/customer/profiles');
  },
  getCoupons() {
    return request('/customer/coupons');
  },
  getWishlist() {
    return request('/customer/wishlist');
  },
  toggleWishlist(productId) {
    return request('/customer/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  },
  getCart(couponCode = '') {
    const query = new URLSearchParams(couponCode ? { coupon: couponCode } : {});
    return request(`/cart?${query.toString()}`);
  },
  updateCart(productId, quantity) {
    return request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  },
  removeCart(productId) {
    return request(`/cart/${productId}`, { method: 'DELETE' });
  },
  getOrders() {
    return request('/orders');
  },
  getCheckoutQuote(couponCode = '') {
    const query = new URLSearchParams(couponCode ? { coupon: couponCode } : {});
    return request(`/orders/quote?${query.toString()}`);
  },
  checkout(method, addressId, couponCode) {
    return request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({ method, addressId, couponCode })
    });
  },
  cancelOrder(orderId) {
    return request(`/orders/${orderId}/cancel`, { method: 'POST' });
  },
  returnOrder(orderId) {
    return request(`/orders/${orderId}/return`, { method: 'POST' });
  },
  getDashboard() {
    return request('/analytics/dashboard');
  }
};
