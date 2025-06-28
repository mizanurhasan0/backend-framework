import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authGuard, requirePermission } from '../middlewares/authGuard';
import { upload } from '../middlewares/uploadFile';

const router = Router();

// Public routes (no authentication required)
router.get('/', ProductController.getProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/new', ProductController.getNewProducts);
router.get('/best-sellers', ProductController.getBestSellers);
router.get('/search', ProductController.searchProducts);
router.get('/category/:categoryId', ProductController.getProductsByCategory);
router.get('/brand/:brand', ProductController.getProductsByBrand);
router.get('/slug/:slug', ProductController.getProductBySlug);
router.get('/:productId', ProductController.getProductById);

// Protected routes (authentication required)
router.use(authGuard);

// Product management routes (admin permissions required)
router.post('/',
    requirePermission('product:create'),
    upload.array('images', 10),
    ProductController.createProduct
);

router.put('/:productId',
    requirePermission('product:update'),
    upload.array('images', 10),
    ProductController.updateProduct
);

router.delete('/:productId',
    requirePermission('product:delete'),
    ProductController.deleteProduct
);

router.patch('/:productId/stock',
    requirePermission('product:update'),
    ProductController.updateStock
);

// Analytics and management routes
router.get('/stats/overview',
    requirePermission('product:read'),
    ProductController.getProductStats
);

router.get('/low-stock',
    requirePermission('product:read'),
    ProductController.getLowStockProducts
);

router.post('/bulk-update',
    requirePermission('product:update'),
    ProductController.bulkUpdateProducts
);

export default router; 