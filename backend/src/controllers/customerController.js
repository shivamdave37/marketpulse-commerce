import {
  deleteAddress,
  getCoupons,
  getProfiles,
  getAddresses,
  getWishlist,
  saveAddress,
  toggleWishlist
} from '../services/customerService.js';

export async function fetchProfiles(_req, res, next) {
  try {
    const profiles = await getProfiles();
    res.json({ profiles });
  } catch (error) {
    next(error);
  }
}

export async function fetchAddresses(req, res, next) {
  try {
    const addresses = await getAddresses(req.userId);
    res.json({ addresses });
  } catch (error) {
    next(error);
  }
}

export async function fetchWishlist(req, res, next) {
  try {
    const wishlist = await getWishlist(req.userId);
    res.json({ wishlist });
  } catch (error) {
    next(error);
  }
}

export async function saveWishlist(req, res, next) {
  try {
    const wishlist = await toggleWishlist(req.userId, req.body.productId);
    res.json({ wishlist });
  } catch (error) {
    next(error);
  }
}

export async function saveAddressAction(req, res, next) {
  try {
    const addresses = await saveAddress(req.userId, req.body);
    res.json({ addresses });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddressAction(req, res, next) {
  try {
    const addresses = await deleteAddress(req.userId, req.params.addressId);
    res.json({ addresses });
  } catch (error) {
    next(error);
  }
}

export async function fetchCoupons(_req, res, next) {
  try {
    res.json({ coupons: getCoupons() });
  } catch (error) {
    next(error);
  }
}
