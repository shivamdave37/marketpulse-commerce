import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

export function useStorefront() {
  const [catalog, setCatalog] = useState({ products: [], categories: [], stats: {} });
  const [cart, setCart] = useState({ items: [], summary: { items: 0, quantity: 0, subtotal: 0 } });
  const [orders, setOrders] = useState([]);
  const [dashboard, setDashboard] = useState({ stats: {}, topCategories: [], recentOrders: [] });
  const [productDetail, setProductDetail] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [filters, setFilters] = useState({ search: '', category: '', sort: 'featured' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function loadAll(nextFilters = filters) {
    setLoading(true);
    setError('');

    try {
      const [catalogData, cartData, orderData, dashboardData, addressData, wishlistData] = await Promise.all([
        api.getCatalog(nextFilters),
        api.getCart(),
        api.getOrders(),
        api.getDashboard(),
        api.getAddresses(),
        api.getWishlist()
      ]);

      setCatalog(catalogData);
      setCart(cartData);
      setOrders(orderData.orders);
      setDashboard(dashboardData);
      setAddresses(addressData.addresses);
      setWishlist(wishlistData.wishlist);
      const defaultAddress = addressData.addresses.find((item) => item.is_default) || addressData.addresses[0];
      setSelectedAddressId((current) => current || defaultAddress?.address_id || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function updateFilters(next) {
    const merged = { ...filters, ...next };
    setFilters(merged);
    await loadAll(merged);
  }

  async function addToCart(productId, quantity = 1) {
    setBusy(true);
    try {
      const updated = await api.updateCart(productId, quantity);
      setCart(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeFromCart(productId) {
    setBusy(true);
    try {
      const updated = await api.removeCart(productId);
      setCart(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function placeCheckout(method) {
    setBusy(true);
    try {
      const result = await api.checkout(method, selectedAddressId);
      await loadAll(filters);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function openProduct(productId) {
    setBusy(true);
    try {
      const detail = await api.getProduct(productId);
      setProductDetail(detail);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function closeProduct() {
    setProductDetail(null);
  }

  async function toggleWishlist(productId) {
    setBusy(true);
    try {
      const result = await api.toggleWishlist(productId);
      setWishlist(result.wishlist);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return {
    catalog,
    cart,
    orders,
    dashboard,
    productDetail,
    addresses,
    wishlist,
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
    setSelectedAddressId,
    setSelectedPaymentMethod
  };
}
