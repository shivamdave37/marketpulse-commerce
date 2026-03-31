import {
  checkoutCart,
  getCheckoutQuote,
  listOrders,
  updateOrderStatus
} from '../services/orderService.js';

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
    const result = await checkoutCart(
      req.userId,
      req.body.method || 'card',
      req.body.addressId || null,
      req.body.couponCode || ''
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function quoteCheckout(req, res, next) {
  try {
    const quote = await getCheckoutQuote(req.userId, req.query.coupon || '');
    res.json({ quote });
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const orders = await updateOrderStatus(req.userId, req.params.orderId, 'cancelled');
    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

export async function returnOrder(req, res, next) {
  try {
    const orders = await updateOrderStatus(req.userId, req.params.orderId, 'returned');
    res.json({ orders });
  } catch (error) {
    next(error);
  }
}
