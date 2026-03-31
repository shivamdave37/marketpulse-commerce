import { Router } from 'express';
import {
  fetchAddresses,
  fetchWishlist,
  saveWishlist
} from '../controllers/customerController.js';

const router = Router();

router.get('/addresses', fetchAddresses);
router.get('/wishlist', fetchWishlist);
router.post('/wishlist', saveWishlist);

export default router;
