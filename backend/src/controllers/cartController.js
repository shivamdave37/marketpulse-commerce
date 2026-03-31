import {
  getCart,
  removeCartItem,
  upsertCartItem
} from '../services/cartService.js';

export async function fetchCart(req, res, next) {
  try {
    const cart = await getCart(req.userId, req.query.coupon || '');
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function saveCartItem(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const cart = await upsertCartItem(req.userId, productId, Number(quantity));
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function deleteCartItem(req, res, next) {
  try {
    const cart = await removeCartItem(req.userId, req.params.productId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
}
