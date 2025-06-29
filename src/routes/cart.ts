import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authGuard, requirePermission } from '../middlewares/authGuard';
import { joiValidation } from '../middlewares/errorsMiddleware';
import { addToCartSchema, updateCartItemSchema, removeFromCartSchema } from '../validations/cart.validation';

const router = Router();

// Apply authentication to all cart routes
router.use(authGuard);

// User cart routes
router.get('/', CartController.getCart);
router.post('/add', joiValidation(addToCartSchema), CartController.addToCart);
router.put('/update', joiValidation(updateCartItemSchema), CartController.updateCartItem);
router.delete('/remove/:itemId', joiValidation(removeFromCartSchema), CartController.removeFromCart);
router.delete('/clear', CartController.clearCart);
router.get('/summary', CartController.getCartSummary);
router.get('/validate', CartController.validateCart);

// Admin routes (require admin permissions)
router.get('/admin/all',
    requirePermission('cart:read'),
    CartController.getAllCarts
);

router.get('/admin/stats',
    requirePermission('cart:read'),
    CartController.getCartStats
);

router.get('/admin/:cartId',
    requirePermission('cart:read'),
    CartController.getCartById
);

export default router; 