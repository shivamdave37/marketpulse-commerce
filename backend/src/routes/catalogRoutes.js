import { Router } from 'express';
import { listCatalog } from '../controllers/catalogController.js';

const router = Router();

router.get('/', listCatalog);

export default router;

