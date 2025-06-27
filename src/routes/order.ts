import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authGuard } from '../middlewares/authGuard';

const router = Router();

// Apply authentication middleware to all order routes
router.use(authGuard);

// Create order
router.post('/', OrderController.createOrder);

// Get user orders
router.get('/', OrderController.getUserOrders);

// Get specific order
router.get('/:orderId', OrderController.getOrder);

// Update order status (admin only)
router.patch('/:orderId/status', OrderController.updateOrderStatus);

// Process Bikash payment
router.post('/:orderId/payment/bikash', OrderController.processBikashPayment);

// Verify Bikash payment
router.post('/:orderId/payment/verify', OrderController.verifyBikashPayment);

// Bikash payment callback (no auth required)
router.post('/payment/callback/bikash', OrderController.bikashCallback);

export default router; 