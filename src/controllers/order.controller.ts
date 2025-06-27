import { Request, Response } from 'express';
import {
    createOrder,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
    processBikashPayment,
    verifyBikashPayment
} from '../services/order.service';
import { TCreateOrder } from '../types/TOrder';

export class OrderController {
    // Create order
    static async createOrder(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const orderData: TCreateOrder = req.body;

            // Validate required fields
            if (!orderData.shippingAddress || !orderData.paymentMethod) {
                res.status(400).json({
                    success: false,
                    message: 'Shipping address and payment method are required'
                });
                return;
            }

            const order = await createOrder(userId, orderData);

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to create order',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get order by ID
    static async getOrder(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const { orderId } = req.params;

            if (!orderId) {
                res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
                return;
            }

            const order = await getOrderById(orderId);

            // Check if user owns this order
            if (order.id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
                return;
            }

            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get order',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get user orders
    static async getUserOrders(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const orders = await getUserOrders(userId);

            res.json({
                success: true,
                data: orders
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get user orders',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Update order status (admin only)
    static async updateOrderStatus(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const { orderId } = req.params;
            const { status } = req.body;

            if (!orderId || !status) {
                res.status(400).json({
                    success: false,
                    message: 'Order ID and status are required'
                });
                return;
            }

            const order = await updateOrderStatus(orderId, status);

            res.json({
                success: true,
                message: 'Order status updated successfully',
                data: order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update order status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Process Bikash payment
    static async processBikashPayment(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const { orderId } = req.params;
            const { phone } = req.body;

            if (!orderId || !phone) {
                res.status(400).json({
                    success: false,
                    message: 'Order ID and phone number are required'
                });
                return;
            }

            const result = await processBikashPayment(orderId, phone);

            if (result.success) {
                res.json({
                    success: true,
                    message: result.message,
                    data: {
                        paymentUrl: result.paymentUrl
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to process payment',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Verify Bikash payment
    static async verifyBikashPayment(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const { orderId } = req.params;
            const { transactionId } = req.body;

            if (!orderId || !transactionId) {
                res.status(400).json({
                    success: false,
                    message: 'Order ID and transaction ID are required'
                });
                return;
            }

            const result = await verifyBikashPayment(orderId, transactionId);

            if (result.success) {
                res.json({
                    success: true,
                    message: result.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to verify payment',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Bikash payment callback
    static async bikashCallback(req: Request, res: Response): Promise<void> {
        try {
            const { paymentID, status, merchantInvoiceNumber } = req.body;

            if (status === 'success') {
                // Process successful payment
                res.json({
                    success: true,
                    message: 'Payment processed successfully'
                });
            } else {
                res.json({
                    success: false,
                    message: 'Payment failed'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Callback processing failed'
            });
        }
    }
} 