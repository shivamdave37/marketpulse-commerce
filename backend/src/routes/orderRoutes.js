import { Router } from 'express';
import {
  cancelOrder,
  checkout,
  fetchOrders,
  quoteCheckout,
  returnOrder
} from '../controllers/orderController.js';

const router = Router();

router.get('/', fetchOrders);
router.get('/quote', quoteCheckout);
router.post('/checkout', checkout);
router.post('/:orderId/cancel', cancelOrder);
router.post('/:orderId/return', returnOrder);

export default router;
