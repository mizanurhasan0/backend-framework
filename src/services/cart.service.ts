import { Cart, ICart } from '../models/cart.model';
import { Product } from '../models/product.model';
import { TAddToCart, TCartResponse, TUpdateCartItem, TCartSummary } from '../types/TCart';
import mongoose from 'mongoose';

// Custom error classes for better error handling
export class CartError extends Error {
    constructor(message: string, public code: string = 'CART_ERROR') {
        super(message);
        this.name = 'CartError';
    }
}

export class ProductError extends Error {
    constructor(message: string, public code: string = 'PRODUCT_ERROR') {
        super(message);
        this.name = 'ProductError';
    }
}

export class CartService {
    // Cache for product data to reduce database queries
    private static productCache = new Map<string, {
        timestamp: number; price: number; stock: number; isActive: boolean; name: string; image?: string | string[]
    }>();
    private static cacheExpiry = 5 * 60 * 1000; // 5 minutes
    private static maxCacheSize = 1000; // Maximum cache entries

    /**
     * Get product from cache or database with improved error handling
     */
    private static async getProduct(productId: string) {
        // Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new ProductError('Invalid product ID format', 'INVALID_PRODUCT_ID');
        }

        const cached = this.productCache.get(productId);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached;
        }

        const product = await Product.findById(productId).lean().select('price stock isActive name image');
        if (!product) {
            throw new ProductError('Product not found', 'PRODUCT_NOT_FOUND');
        }

        const productData = {
            price: product.price,
            stock: product.stock,
            isActive: product.isActive,
            name: product.name,
            image: product.images,
            timestamp: Date.now()
        };

        // Manage cache size
        if (this.productCache.size >= this.maxCacheSize) {
            this.clearExpiredCache();
            if (this.productCache.size >= this.maxCacheSize) {
                // If still full, clear oldest entries
                const entries = Array.from(this.productCache.entries());
                entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
                const toRemove = entries.slice(0, Math.floor(this.maxCacheSize * 0.2)); // Remove 20% oldest
                toRemove.forEach(([key]) => this.productCache.delete(key));
            }
        }

        this.productCache.set(productId, productData);
        return productData;
    }

    /**
     * Clear expired cache entries
     */
    private static clearExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.productCache.entries()) {
            if (now - value.timestamp > this.cacheExpiry) {
                this.productCache.delete(key);
            }
        }
    }

    /**
     * Invalidate product cache for a specific product
     */
    static invalidateProductCache(productId: string): void {
        this.productCache.delete(productId);
    }

    /**
     * Clear entire product cache
     */
    static clearProductCache(): void {
        this.productCache.clear();
    }

    /**
     * Get user's cart with optimized query and better error handling
     */
    static async getUserCart(userId: string): Promise<TCartResponse | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new CartError('Invalid user ID format', 'INVALID_USER_ID');
            }

            const cart = await Cart.findOne({ user: userId, isActive: true })
                .populate('items.product', 'name price image stock isActive')
                .lean();

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
        } catch (error: any) {
            if (error instanceof CartError) {
                throw error;
            }
            throw new CartError(`Failed to get user cart: ${error.message}`, 'GET_CART_ERROR');
        }
    }

    /**
     * Add item to cart with transaction and optimized validation
     */
    static async addToCart(userId: string, cartData: TAddToCart): Promise<TCartResponse> {
        const session = await mongoose.startSession();

        try {
            // Validate input
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new CartError('Invalid user ID format', 'INVALID_USER_ID');
            }

            if (!mongoose.Types.ObjectId.isValid(cartData.productId)) {
                throw new CartError('Invalid product ID format', 'INVALID_PRODUCT_ID');
            }

            if (cartData.quantity <= 0) {
                throw new CartError('Quantity must be greater than 0', 'INVALID_QUANTITY');
            }

            await session.withTransaction(async () => {
                // Validate product first
                const product = await this.getProduct(cartData.productId);

                if (!product.isActive) {
                    throw new ProductError('Product is not available', 'PRODUCT_INACTIVE');
                }

                if (product.stock < cartData.quantity) {
                    throw new ProductError('Insufficient stock', 'INSUFFICIENT_STOCK');
                }

                // Get or create cart with session
                let cart = await Cart.findOne({ user: userId, isActive: true }).session(session);

                if (!cart) {
                    cart = new Cart({ user: userId, items: [] });
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
                        throw new ProductError('Insufficient stock for requested quantity', 'INSUFFICIENT_STOCK');
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

                await cart.save({ session });
            });

            // Clear expired cache
            this.clearExpiredCache();

            return await this.getUserCart(userId) as TCartResponse;
        } catch (error: any) {
            if (error instanceof ProductError || error instanceof CartError) {
                throw error;
            }
            throw new CartError(`Failed to add item to cart: ${error.message}`, 'ADD_TO_CART_ERROR');
        } finally {
            await session.endSession();
        }
    }

    /**
     * Update cart item with transaction and improved validation
     */
    static async updateCartItem(userId: string, updateData: TUpdateCartItem): Promise<TCartResponse> {
        const session = await mongoose.startSession();

        try {
            // Validate input
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new CartError('Invalid user ID format', 'INVALID_USER_ID');
            }

            if (!mongoose.Types.ObjectId.isValid(updateData.itemId)) {
                throw new CartError('Invalid item ID format', 'INVALID_ITEM_ID');
            }

            if (updateData.quantity < 0) {
                throw new CartError('Quantity cannot be negative', 'INVALID_QUANTITY');
            }

            await session.withTransaction(async () => {
                const cart = await Cart.findOne({ user: userId, isActive: true }).session(session);
                if (!cart) {
                    throw new CartError('Cart not found', 'CART_NOT_FOUND');
                }

                const itemIndex = cart.items.findIndex(item => item._id.toString() === updateData.itemId);
                if (itemIndex === -1) {
                    throw new CartError('Item not found in cart', 'ITEM_NOT_FOUND');
                }

                if (updateData.quantity <= 0) {
                    cart.items.splice(itemIndex, 1);
                } else {
                    // Check stock availability
                    const product = await this.getProduct(cart.items[itemIndex].product.toString());
                    if (product.stock < updateData.quantity) {
                        throw new ProductError('Insufficient stock', 'INSUFFICIENT_STOCK');
                    }
                    cart.items[itemIndex].quantity = updateData.quantity;
                }

                await cart.save({ session });
            });

            return await this.getUserCart(userId) as TCartResponse;
        } catch (error: any) {
            if (error instanceof ProductError || error instanceof CartError) {
                throw error;
            }
            throw new CartError(`Failed to update cart item: ${error.message}`, 'UPDATE_CART_ERROR');
        } finally {
            await session.endSession();
        }
    }

    /**
     * Remove item from cart with transaction
     */
    static async removeFromCart(userId: string, itemId: string): Promise<TCartResponse> {
        const session = await mongoose.startSession();

        try {
            // Validate input
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new CartError('Invalid user ID format', 'INVALID_USER_ID');
            }

            if (!mongoose.Types.ObjectId.isValid(itemId)) {
                throw new CartError('Invalid item ID format', 'INVALID_ITEM_ID');
            }

            await session.withTransaction(async () => {
                const cart = await Cart.findOne({ user: userId, isActive: true }).session(session);
                if (!cart) {
                    throw new CartError('Cart not found', 'CART_NOT_FOUND');
                }

                const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
                if (itemIndex === -1) {
                    throw new CartError('Item not found in cart', 'ITEM_NOT_FOUND');
                }

                cart.items.splice(itemIndex, 1);
                await cart.save({ session });
            });

            return await this.getUserCart(userId) as TCartResponse;
        } catch (error: any) {
            if (error instanceof CartError) {
                throw error;
            }
            throw new CartError(`Failed to remove item from cart: ${error.message}`, 'REMOVE_FROM_CART_ERROR');
        } finally {
            await session.endSession();
        }
    }

    /**
     * Clear cart with transaction
     */
    static async clearCart(userId: string): Promise<void> {
        const session = await mongoose.startSession();

        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new CartError('Invalid user ID format', 'INVALID_USER_ID');
            }

            await session.withTransaction(async () => {
                const cart = await Cart.findOne({ user: userId, isActive: true }).session(session);
                if (cart) {
                    cart.items = [];
                    await cart.save({ session });
                }
            });
        } catch (error: any) {
            if (error instanceof CartError) {
                throw error;
            }
            throw new CartError(`Failed to clear cart: ${error.message}`, 'CLEAR_CART_ERROR');
        } finally {
            await session.endSession();
        }
    }

    /**
     * Get cart summary with optimized query
     */
    static async getCartSummary(userId: string): Promise<TCartSummary> {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new CartError('Invalid user ID format', 'INVALID_USER_ID');
            }

            const cart = await Cart.findOne({ user: userId, isActive: true })
                .select('totalItems totalAmount items')
                .lean();

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
        } catch (error: any) {
            if (error instanceof CartError) {
                throw error;
            }
            throw new CartError(`Failed to get cart summary: ${error.message}`, 'GET_SUMMARY_ERROR');
        }
    }

    /**
     * Validate cart with optimized queries and detailed error reporting
     */
    static async validateCart(userId: string): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new CartError('Invalid user ID format', 'INVALID_USER_ID');
            }

            const cart = await Cart.findOne({ user: userId, isActive: true })
                .populate('items.product', 'name stock isActive')
                .lean();

            if (!cart || cart.items.length === 0) {
                return {
                    valid: false,
                    errors: ['Cart is empty'],
                    warnings: []
                };
            }

            const errors: string[] = [];
            const warnings: string[] = [];
            const productIds = cart.items.map(item => item.product._id.toString());

            // Batch fetch products for validation
            const products = await Product.find({ _id: { $in: productIds } })
                .select('name stock isActive')
                .lean();

            const productMap = new Map(products.map(p => [p._id.toString(), p]));

            for (const item of cart.items) {
                const productId = item.product._id.toString();
                const product = productMap.get(productId);

                if (!product) {
                    errors.push(`Product ${productId} not found`);
                    continue;
                }

                if (!product.isActive) {
                    errors.push(`Product ${product.name} is not available`);
                }

                if (product.stock < item.quantity) {
                    errors.push(`Insufficient stock for ${product.name} (requested: ${item.quantity}, available: ${product.stock})`);
                } else if (product.stock <= item.quantity + 2) { // Warning if stock is low
                    warnings.push(`Low stock for ${product.name} (${product.stock} remaining)`);
                }
            }

            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        } catch (error: any) {
            if (error instanceof CartError) {
                throw error;
            }
            throw new CartError(`Failed to validate cart: ${error.message}`, 'VALIDATE_CART_ERROR');
        }
    }

    /**
     * Get cart by ID (admin only) with optimized query
     */
    static async getCartById(cartId: string): Promise<ICart | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new CartError('Invalid cart ID format', 'INVALID_CART_ID');
            }

            return await Cart.findById(cartId)
                .populate('user', 'name email')
                .populate('items.product', 'name price image')
                .lean();
        } catch (error: any) {
            if (error instanceof CartError) {
                throw error;
            }
            throw new CartError(`Failed to get cart by ID: ${error.message}`, 'GET_CART_BY_ID_ERROR');
        }
    }

    /**
     * Get all carts (admin only) with pagination and optimized queries
     */
    static async getAllCarts(page: number = 1, limit: number = 10, filters: any = {}) {
        try {
            // Validate pagination parameters
            if (page < 1) page = 1;
            if (limit < 1 || limit > 100) limit = 10; // Max 100 items per page

            const skip = (page - 1) * limit;
            const query: any = {};

            if (filters.user) {
                if (!mongoose.Types.ObjectId.isValid(filters.user)) {
                    throw new CartError('Invalid user ID in filters', 'INVALID_FILTER_USER_ID');
                }
                query.user = filters.user;
            }
            if (filters.isActive !== undefined) query.isActive = filters.isActive;

            const [carts, total] = await Promise.all([
                Cart.find(query)
                    .populate('user', 'name email')
                    .populate('items.product', 'name price image')
                    .skip(skip)
                    .limit(limit)
                    .sort({ updatedAt: -1 })
                    .lean(),
                Cart.countDocuments(query)
            ]);

            return {
                carts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error: any) {
            if (error instanceof CartError) {
                throw error;
            }
            throw new CartError(`Failed to get all carts: ${error.message}`, 'GET_ALL_CARTS_ERROR');
        }
    }

    /**
     * Get cart statistics (admin only) with optimized aggregation
     */
    static async getCartStats() {
        try {
            const [totalCarts, activeCarts, emptyCarts, totalItemsResult, averageItemsResult] = await Promise.all([
                Cart.countDocuments(),
                Cart.countDocuments({ isActive: true }),
                Cart.countDocuments({ 'items.0': { $exists: false } }),
                Cart.aggregate([
                    { $group: { _id: null, total: { $sum: '$totalItems' } } }
                ]),
                Cart.aggregate([
                    { $match: { 'items.0': { $exists: true } } },
                    { $group: { _id: null, average: { $avg: '$totalItems' } } }
                ])
            ]);

            return {
                totalCarts,
                activeCarts,
                emptyCarts,
                totalItems: totalItemsResult[0]?.total || 0,
                averageItems: Math.round((averageItemsResult[0]?.average || 0) * 100) / 100
            };
        } catch (error: any) {
            throw new CartError(`Failed to get cart stats: ${error.message}`, 'GET_CART_STATS_ERROR');
        }
    }

    /**
     * Bulk operations for performance
     */
    static async bulkUpdateCarts(updates: Array<{ cartId: string; updates: any }>) {
        const session = await mongoose.startSession();

        try {
            // Validate all cart IDs first
            for (const { cartId } of updates) {
                if (!mongoose.Types.ObjectId.isValid(cartId)) {
                    throw new CartError(`Invalid cart ID: ${cartId}`, 'INVALID_CART_ID');
                }
            }

            await session.withTransaction(async () => {
                const bulkOps = updates.map(({ cartId, updates }) => ({
                    updateOne: {
                        filter: { _id: cartId },
                        update: updates
                    }
                }));

                await Cart.bulkWrite(bulkOps, { session });
            });
        } catch (error: any) {
            if (error instanceof CartError) {
                throw error;
            }
            throw new CartError(`Failed to bulk update carts: ${error.message}`, 'BULK_UPDATE_ERROR');
        } finally {
            await session.endSession();
        }
    }

    /**
     * Merge carts (useful for guest to user conversion)
     */
    static async mergeCarts(guestCartId: string, userCartId: string): Promise<TCartResponse> {
        const session = await mongoose.startSession();

        try {
            if (!mongoose.Types.ObjectId.isValid(guestCartId) || !mongoose.Types.ObjectId.isValid(userCartId)) {
                throw new CartError('Invalid cart ID format', 'INVALID_CART_ID');
            }

            await session.withTransaction(async () => {
                const [guestCart, userCart] = await Promise.all([
                    Cart.findById(guestCartId).session(session),
                    Cart.findById(userCartId).session(session)
                ]);

                if (!guestCart || !userCart) {
                    throw new CartError('One or both carts not found', 'CART_NOT_FOUND');
                }

                // Merge items from guest cart to user cart
                for (const guestItem of guestCart.items) {
                    const existingItemIndex = userCart.items.findIndex(
                        item => item.product.toString() === guestItem.product.toString() &&
                            item.variant === guestItem.variant
                    );

                    if (existingItemIndex > -1) {
                        userCart.items[existingItemIndex].quantity += guestItem.quantity;
                    } else {
                        userCart.items.push(guestItem);
                    }
                }

                await userCart.save({ session });
                await Cart.findByIdAndDelete(guestCartId).session(session);
            });

            return await this.getUserCart(userCartId) as TCartResponse;
        } catch (error: any) {
            if (error instanceof CartError) {
                throw error;
            }
            throw new CartError(`Failed to merge carts: ${error.message}`, 'MERGE_CARTS_ERROR');
        } finally {
            await session.endSession();
        }
    }
}
