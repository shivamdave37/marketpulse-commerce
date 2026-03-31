import {
  getAddresses,
  getWishlist,
  toggleWishlist
} from '../services/customerService.js';

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
