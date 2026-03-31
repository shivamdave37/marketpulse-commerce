import { useEffect, useState } from 'react';
import { api, setApiUserId } from '../services/api.js';

export function useStorefront() {
  const [profiles, setProfiles] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(
    import.meta.env.VITE_USER_ID || '11111111-1111-1111-1111-111111111111'
  );
  const [catalog, setCatalog] = useState({ products: [], categories: [], stats: {} });
  const [cart, setCart] = useState({ items: [], summary: { items: 0, quantity: 0, subtotal: 0 } });
  const [orders, setOrders] = useState([]);
  const [dashboard, setDashboard] = useState({ stats: {}, topCategories: [], recentOrders: [] });
  const [productDetail, setProductDetail] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [addressDraft, setAddressDraft] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '', sort: 'featured' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function loadAll(nextFilters = filters, nextCouponCode = couponCode) {
    setLoading(true);
    setError('');
    setApiUserId(currentUserId);

    try {
      const [profileData, catalogData, cartData, orderData, dashboardData, addressData, wishlistData, couponData] = await Promise.all([
        api.getProfiles(),
        api.getCatalog(nextFilters),
        api.getCart(nextCouponCode),
        api.getOrders(),
        api.getDashboard(),
        api.getAddresses(),
        api.getWishlist(),
        api.getCoupons()
      ]);

      setProfiles(profileData.profiles);
      setCatalog(catalogData);
      setCart(cartData);
      setOrders(orderData.orders);
      setDashboard(dashboardData);
      setAddresses(addressData.addresses);
      setWishlist(wishlistData.wishlist);
      setCoupons(couponData.coupons);
      const defaultAddress = addressData.addresses.find((item) => item.is_default) || addressData.addresses[0];
      setSelectedAddressId((current) => {
        if (addressData.addresses.some((item) => item.address_id === current)) {
          return current;
        }

        return defaultAddress?.address_id || '';
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, [currentUserId]);

  async function updateFilters(next) {
    const merged = { ...filters, ...next };
    setFilters(merged);
    await loadAll(merged);
  }

  async function addToCart(productId, quantity = 1) {
    setBusy(true);
    try {
      await api.updateCart(productId, quantity);
      const refreshed = await api.getCart(couponCode);
      setCart(refreshed);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeFromCart(productId) {
    setBusy(true);
    try {
      await api.removeCart(productId);
      const refreshed = await api.getCart(couponCode);
      setCart(refreshed);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function placeCheckout(method) {
    setBusy(true);
    try {
      const result = await api.checkout(method, selectedAddressId, couponCode);
      setCouponCode('');
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

  async function saveAddress(payload) {
    setBusy(true);
    try {
      const result = await api.saveAddress(payload);
      setAddresses(result.addresses);
      setAddressDraft(null);
      const defaultAddress = result.addresses.find((item) => item.is_default) || result.addresses[0];
      setSelectedAddressId(defaultAddress?.address_id || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteAddress(addressId) {
    setBusy(true);
    try {
      const result = await api.deleteAddress(addressId);
      setAddresses(result.addresses);
      const defaultAddress = result.addresses.find((item) => item.is_default) || result.addresses[0];
      setSelectedAddressId(defaultAddress?.address_id || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function refreshQuote(nextCouponCode) {
    setBusy(true);
    try {
      const [quoteResult, cartResult] = await Promise.all([
        api.getCheckoutQuote(nextCouponCode),
        api.getCart(nextCouponCode)
      ]);
      setCouponCode(nextCouponCode);
      setCart({
        ...cartResult,
        summary: {
          ...cartResult.summary,
          ...quoteResult.quote
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function cancelOrder(orderId) {
    setBusy(true);
    try {
      const result = await api.cancelOrder(orderId);
      setOrders(result.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function returnOrder(orderId) {
    setBusy(true);
    try {
      const result = await api.returnOrder(orderId);
      setOrders(result.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return {
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
    selectedAddressId,
    selectedPaymentMethod,
    couponCode,
    addressDraft,
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
  };
}
