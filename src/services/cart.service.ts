import { Cart, ICart } from '../models/cart.model';
import { Product } from '../models/product.model';
import { TAddToCart, TCartResponse, TUpdateCartItem, TCartSummary } from '../types/TCart';

// Get user's cart
export const getUserCart = async (userId: string): Promise<TCartResponse | null> => {
    const cart = await Cart.findOne({ user: userId, isActive: true })
        .populate({
            path: 'items.product',
            select: 'name price image'
        });

    if (!cart) return null;

    return {
        id: cart._id.toString(),
        items: cart.items.map(item => ({
            id: item._id.toString(),
            product: {
                id: item.product._id.toString(),
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
};

// Add item to cart
export const addToCart = async (userId: string, cartData: TAddToCart): Promise<TCartResponse> => {
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

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === cartData.productId &&
            item.variant === cartData.variant
    );

    if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += cartData.quantity;
    } else {
        // Add new item
        cart.items.push({
            product: cartData.productId,
            quantity: cartData.quantity,
            price: product.price,
            variant: cartData.variant
        });
    }

    await cart.save();
    return await getUserCart(userId) as TCartResponse;
};

// Update cart item
export const updateCartItem = async (userId: string, updateData: TUpdateCartItem): Promise<TCartResponse> => {
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
        cart.items[itemIndex].quantity = updateData.quantity;
    }

    await cart.save();
    return await getUserCart(userId) as TCartResponse;
};

// Remove item from cart
export const removeFromCart = async (userId: string, itemId: string): Promise<TCartResponse> => {
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

    return await getUserCart(userId) as TCartResponse;
};

// Clear cart
export const clearCart = async (userId: string): Promise<void> => {
    const cart = await Cart.findOne({ user: userId, isActive: true });
    if (cart) {
        cart.items = [];
        await cart.save();
    }
};

// Get cart summary
export const getCartSummary = async (userId: string): Promise<TCartSummary> => {
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
};

// Check cart validity
export const validateCart = async (userId: string): Promise<{ valid: boolean; errors: string[] }> => {
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
}; 