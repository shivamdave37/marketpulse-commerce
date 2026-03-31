import { Router } from 'express';
import { checkout, fetchOrders } from '../controllers/orderController.js';

const router = Router();

router.get('/', fetchOrders);
router.post('/checkout', checkout);

export default router;

