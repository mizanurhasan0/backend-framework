import { Cart, ICart, ICartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { TAddToCart, TCartResponse, TUpdateCartItem, TCartSummary } from '../types/TCart';
import mongoose from 'mongoose';

export class CartService {
    // Get user's cart
    static async getUserCart(userId: string): Promise<TCartResponse | null> {
        const cart = await Cart.findOne({ user: userId, isActive: true })
            .populate({
                path: 'items.product',
                select: 'name price image stock isActive'
            });

        if (!cart) return null;

        return {
            id: cart._id.toString(),
            items: cart.items.map(item => ({
                id: item._id.toString(),
                product: {
                    id: (item.product as any)._id.toString(),
                    name: (item.product as any).name,
                    price: (item.product as any).price,
                    image: (item.product as any).image
                },
                quantity: item.quantity,
                price: item.price,
                variant: item.variant,
                total: item.price * item.quantity
            })),
            totalAmount: cart.totalAmount,
            totalItems: cart.totalItems
        };
    }

    // Add item to cart
    static async addToCart(userId: string, cartData: TAddToCart): Promise<TCartResponse> {
        // Get or create cart
        let cart = await Cart.findOne({ user: userId, isActive: true });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Get product details
        const product = await Product.findById(cartData.productId);
        if (!product) {
            throw new Error('Product not found');
        }

        if (!product.isActive) {
            throw new Error('Product is not available');
        }

        if (product.stock < cartData.quantity) {
            throw new Error('Insufficient stock');
        }

        // Check if item already exists
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === cartData.productId &&
                item.variant === cartData.variant
        );

        if (existingItemIndex > -1) {
            // Update quantity
            const newQuantity = cart.items[existingItemIndex].quantity + cartData.quantity;
            if (product.stock < newQuantity) {
                throw new Error('Insufficient stock for requested quantity');
            }
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item
            cart.items.push({
                product: new mongoose.Types.ObjectId(cartData.productId),
                quantity: cartData.quantity,
                price: product.price,
                variant: cartData.variant
            } as any);
        }

        await cart.save();
        return await this.getUserCart(userId) as TCartResponse;
    }

    // Update cart item
    static async updateCartItem(userId: string, updateData: TUpdateCartItem): Promise<TCartResponse> {
        const cart = await Cart.findOne({ user: userId, isActive: true });
        if (!cart) {
            throw new Error('Cart not found');
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === updateData.itemId);
        if (itemIndex === -1) {
            throw new Error('Item not found in cart');
        }

        if (updateData.quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            // Check stock availability
            const product = await Product.findById(cart.items[itemIndex].product);
            if (product && product.stock < updateData.quantity) {
                throw new Error('Insufficient stock');
            }
            cart.items[itemIndex].quantity = updateData.quantity;
        }

        await cart.save();
        return await this.getUserCart(userId) as TCartResponse;
    }

    // Remove item from cart
    static async removeFromCart(userId: string, itemId: string): Promise<TCartResponse> {
        const cart = await Cart.findOne({ user: userId, isActive: true });
        if (!cart) {
            throw new Error('Cart not found');
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            throw new Error('Item not found in cart');
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();

        return await this.getUserCart(userId) as TCartResponse;
    }

    // Clear cart
    static async clearCart(userId: string): Promise<void> {
        const cart = await Cart.findOne({ user: userId, isActive: true });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
    }

    // Get cart summary
    static async getCartSummary(userId: string): Promise<TCartSummary> {
        const cart = await Cart.findOne({ user: userId, isActive: true });

        if (!cart) {
            return {
                totalItems: 0,
                totalAmount: 0,
                itemCount: 0
            };
        }

        return {
            totalItems: cart.totalItems,
            totalAmount: cart.totalAmount,
            itemCount: cart.items.length
        };
    }

    // Check cart validity
    static async validateCart(userId: string): Promise<{ valid: boolean; errors: string[] }> {
        const cart = await Cart.findOne({ user: userId, isActive: true })
            .populate('items.product');

        if (!cart || cart.items.length === 0) {
            return { valid: false, errors: ['Cart is empty'] };
        }

        const errors: string[] = [];

        for (const item of cart.items) {
            const product = item.product as any;

            if (!product) {
                errors.push(`Product ${item.product} not found`);
                continue;
            }

            if (!product.isActive) {
                errors.push(`Product ${product.name} is not available`);
            }

            if (product.stock < item.quantity) {
                errors.push(`Insufficient stock for ${product.name}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Get cart by ID (admin only)
    static async getCartById(cartId: string): Promise<ICart | null> {
        return await Cart.findById(cartId)
            .populate('user', 'name email')
            .populate('items.product', 'name price image');
    }

    // Get all carts (admin only)
    static async getAllCarts(page: number = 1, limit: number = 10, filters: any = {}) {
        const skip = (page - 1) * limit;

        const query: any = {};
        if (filters.user) query.user = filters.user;
        if (filters.isActive !== undefined) query.isActive = filters.isActive;

        const carts = await Cart.find(query)
            .populate('user', 'name email')
            .populate('items.product', 'name price image')
            .skip(skip)
            .limit(limit)
            .sort({ updatedAt: -1 });

        const total = await Cart.countDocuments(query);

        return {
            carts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Get cart statistics (admin only)
    static async getCartStats() {
        const totalCarts = await Cart.countDocuments();
        const activeCarts = await Cart.countDocuments({ isActive: true });
        const emptyCarts = await Cart.countDocuments({ 'items.0': { $exists: false } });
        const totalItems = await Cart.aggregate([
            { $group: { _id: null, total: { $sum: '$totalItems' } } }
        ]);

        return {
            totalCarts,
            activeCarts,
            emptyCarts,
            totalItems: totalItems[0]?.total || 0
        };
    }
}
