import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';

export class CartController {
    // Get user's cart
    static async getCart(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const cart = await CartService.getUserCart(userId);

            if (!cart) {
                return res.json({
                    success: true,
                    data: {
                        id: null,
                        items: [],
                        totalAmount: 0,
                        totalItems: 0
                    }
                });
            }

            res.json({
                success: true,
                data: cart
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Add item to cart
    static async addToCart(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const cartData = req.body;

            const cart = await CartService.addToCart(userId, cartData);

            res.json({
                success: true,
                message: 'Item added to cart successfully',
                data: cart
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update cart item
    static async updateCartItem(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const updateData = req.body;

            const cart = await CartService.updateCartItem(userId, updateData);

            res.json({
                success: true,
                message: 'Cart item updated successfully',
                data: cart
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Remove item from cart
    static async removeFromCart(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { itemId } = req.params;

            const cart = await CartService.removeFromCart(userId, itemId);

            res.json({
                success: true,
                message: 'Item removed from cart successfully',
                data: cart
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Clear cart
    static async clearCart(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;

            await CartService.clearCart(userId);

            res.json({
                success: true,
                message: 'Cart cleared successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get cart summary
    static async getCartSummary(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const summary = await CartService.getCartSummary(userId);

            res.json({
                success: true,
                data: summary
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Validate cart
    static async validateCart(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const validation = await CartService.validateCart(userId);

            res.json({
                success: true,
                data: validation
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get cart by ID (admin only)
    static async getCartById(req: Request, res: Response) {
        try {
            const { cartId } = req.params;
            const cart = await CartService.getCartById(cartId);

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: 'Cart not found'
                });
            }

            res.json({
                success: true,
                data: cart
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get all carts (admin only)
    static async getAllCarts(req: Request, res: Response) {
        try {
            const { page, limit, ...filters } = req.query;
            const result = await CartService.getAllCarts(
                Number(page) || 1,
                Number(limit) || 10,
                filters
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get cart statistics (admin only)
    static async getCartStats(req: Request, res: Response) {
        try {
            const stats = await CartService.getCartStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
} 