const API_URL = import.meta.env.VITE_API_URL || '/api';
const USER_ID =
  import.meta.env.VITE_USER_ID || '11111111-1111-1111-1111-111111111111';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
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
  getWishlist() {
    return request('/customer/wishlist');
  },
  toggleWishlist(productId) {
    return request('/customer/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  },
  getCart() {
    return request('/cart');
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
  checkout(method, addressId) {
    return request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({ method, addressId })
    });
  },
  getDashboard() {
    return request('/analytics/dashboard');
  }
};
