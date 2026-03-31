import { Router } from 'express';
import {
  deleteAddressAction,
  fetchCoupons,
  fetchProfiles,
  fetchAddresses,
  fetchWishlist,
  saveAddressAction,
  saveWishlist
} from '../controllers/customerController.js';

const router = Router();

router.get('/profiles', fetchProfiles);
router.get('/coupons', fetchCoupons);
router.get('/addresses', fetchAddresses);
router.post('/addresses', saveAddressAction);
router.delete('/addresses/:addressId', deleteAddressAction);
router.get('/wishlist', fetchWishlist);
router.post('/wishlist', saveWishlist);

export default router;
