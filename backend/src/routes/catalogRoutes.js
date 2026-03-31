import { Router } from 'express';
import { listCatalog, showProduct } from '../controllers/catalogController.js';

const router = Router();

router.get('/', listCatalog);
router.get('/:productId', showProduct);

export default router;
