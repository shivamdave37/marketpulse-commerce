import { Router } from 'express';
import {
  deleteCartItem,
  fetchCart,
  saveCartItem
} from '../controllers/cartController.js';

const router = Router();

router.get('/', fetchCart);
router.post('/', saveCartItem);
router.delete('/:productId', deleteCartItem);

export default router;

