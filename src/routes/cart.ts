import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authGuard } from '../middlewares/authGuard';

const router = Router();

// Apply authentication middleware to all cart routes
router.use(authGuard);

// Get user's cart
router.get('/', CartController.getCart);

// Add item to cart
router.post('/add', CartController.addToCart);

// Update cart item
router.put('/update', CartController.updateCartItem);

// Remove item from cart
router.delete('/remove/:itemId', CartController.removeFromCart);

// Clear cart
router.delete('/clear', CartController.clearCart);

// Get cart summary
router.get('/summary', CartController.getCartSummary);

export default router; 