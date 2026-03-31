import { checkoutCart, listOrders } from '../services/orderService.js';

export async function fetchOrders(req, res, next) {
  try {
    const orders = await listOrders(req.userId);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

export async function checkout(req, res, next) {
  try {
    const result = await checkoutCart(req.userId, req.body.method || 'card');
    res.json(result);
  } catch (error) {
    next(error);
  }
}

