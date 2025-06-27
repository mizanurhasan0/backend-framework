import { Request, Response } from 'express';
import {
    getUserCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartSummary
} from '../services/cart.service';
import { TAddToCart, TUpdateCartItem } from '../types/TCart';

export class CartController {
    // Get user's cart
    static async getCart(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const cart = await getUserCart(userId);

            res.json({
                success: true,
                data: cart || { items: [], totalAmount: 0, totalItems: 0 }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get cart',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Add item to cart
    static async addToCart(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const cartData: TAddToCart = req.body;

            // Validate required fields
            if (!cartData.productId || !cartData.quantity) {
                res.status(400).json({
                    success: false,
                    message: 'Product ID and quantity are required'
                });
                return;
            }

            if (cartData.quantity <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Quantity must be greater than 0'
                });
                return;
            }

            const cart = await addToCart(userId, cartData);

            res.json({
                success: true,
                message: 'Item added to cart successfully',
                data: cart
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to add item to cart',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Update cart item
    static async updateCartItem(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const updateData: TUpdateCartItem = req.body;

            if (!updateData.itemId || updateData.quantity === undefined) {
                res.status(400).json({
                    success: false,
                    message: 'Item ID and quantity are required'
                });
                return;
            }

            const cart = await updateCartItem(userId, updateData);

            res.json({
                success: true,
                message: 'Cart item updated successfully',
                data: cart
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update cart item',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Remove item from cart
    static async removeFromCart(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const { itemId } = req.params;

            if (!itemId) {
                res.status(400).json({
                    success: false,
                    message: 'Item ID is required'
                });
                return;
            }

            const cart = await removeFromCart(userId, itemId);

            res.json({
                success: true,
                message: 'Item removed from cart successfully',
                data: cart
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to remove item from cart',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Clear cart
    static async clearCart(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            await clearCart(userId);

            res.json({
                success: true,
                message: 'Cart cleared successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to clear cart',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get cart summary
    static async getCartSummary(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const summary = await getCartSummary(userId);

            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get cart summary',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 