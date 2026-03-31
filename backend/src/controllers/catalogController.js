import {
  getCategories,
  getFeaturedStats,
  getHomeCatalog,
  getProductDetail
} from '../services/catalogService.js';

export async function listCatalog(req, res, next) {
  try {
    const products = await getHomeCatalog({
      search: req.query.search || '',
      category: req.query.category || '',
      sort: req.query.sort || 'featured'
    });

    const [categories, stats] = await Promise.all([
      getCategories(),
      getFeaturedStats()
    ]);

    res.json({ products, categories, stats });
  } catch (error) {
    next(error);
  }
}

export async function showProduct(req, res, next) {
  try {
    const detail = await getProductDetail(req.params.productId);
    res.json(detail);
  } catch (error) {
    next(error);
  }
}
