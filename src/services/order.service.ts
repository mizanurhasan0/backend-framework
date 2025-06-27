import { Order, IOrder } from '../models/order.model';
import { Cart } from '../models/cart.model';
import { Product, IProduct } from '../models/product.model';
import { TCreateOrder, TOrderResponse, TOrderStatus } from '../types/TOrder';
import { createBikashPayment, verifyBikashPayment as verifyPayment } from './payment.service';
import { clearCart } from './cart.service';
import { sendEmail } from './email.service';

// Calculate order totals
const calculateOrderTotals = (items: any[], shippingCost: number = 0): {
    subtotal: number;
    tax: number;
    totalAmount: number;
} => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.15; // 15% VAT
    const totalAmount = subtotal + tax + shippingCost;

    return { subtotal, tax, totalAmount };
};

// Create order from cart
export const createOrder = async (userId: string, orderData: TCreateOrder): Promise<TOrderResponse> => {
    // Get user's cart
    const cart = await Cart.findOne({ user: userId, isActive: true })
        .populate('items.product');

    if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
    }

    // Validate products
    for (const item of cart.items) {
        const product = item.product as unknown as IProduct;
        if (!product.isActive) {
            throw new Error(`Product ${product.name} is not available`);
        }
        if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`);
        }
    }

    // Prepare order items
    const orderItems = cart.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant,
        total: item.price * item.quantity
    }));

    // Calculate totals
    const { subtotal, tax, totalAmount } = calculateOrderTotals(orderItems);

    // Create order
    const order = new Order({
        user: userId,
        items: orderItems,
        shippingAddress: orderData.shippingAddress,
        paymentDetails: {
            method: orderData.paymentMethod,
            amount: totalAmount,
            status: 'pending'
        },
        subtotal,
        tax,
        shippingCost: 0, // Free shipping for now
        totalAmount,
        notes: orderData.notes
    });

    await order.save();

    // Update product stock
    for (const item of cart.items) {
        const product = item.product as unknown as IProduct;
        product.stock -= item.quantity;
        await product.save();
    }

    // Clear cart
    await clearCart(userId);

    // Send order confirmation email
    await sendEmail({
        to: orderData.shippingAddress.phone, // Using phone as email for demo
        subject: `Order Confirmation - ${order.orderNumber}`,
        template: 'order-confirmation',
        data: {
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            items: orderItems.length
        }
    });

    return await getOrderById(order._id.toString());
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<TOrderResponse> => {
    const order = await Order.findById(orderId)
        .populate('items.product', 'name price thumbnail');

    if (!order) {
        throw new Error('Order not found');
    }

    return {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        items: order.items.map(item => ({
            id: item._id.toString(),
            product: {
                id: (item.product as unknown as IProduct)._id.toString(),
                name: (item.product as unknown as IProduct).name,
                price: (item.product as unknown as IProduct).price,
                image: (item.product as unknown as IProduct).thumbnail
            },
            quantity: item.quantity,
            price: item.price,
            variant: item.variant,
            total: item.total
        })),
        shippingAddress: order.shippingAddress,
        paymentDetails: {
            method: order.paymentDetails.method,
            transactionId: order.paymentDetails.transactionId,
            amount: order.paymentDetails.amount,
            status: order.paymentDetails.status,
            paidAt: order.paymentDetails.paidAt
        },
        subtotal: order.subtotal,
        tax: order.tax,
        shippingCost: order.shippingCost,
        totalAmount: order.totalAmount,
        status: order.status,
        notes: order.notes,
        createdAt: order.createdAt
    };
};

// Get user orders
export const getUserOrders = async (userId: string): Promise<TOrderResponse[]> => {
    const orders = await Order.find({ user: userId })
        .populate('items.product', 'name price thumbnail')
        .sort({ createdAt: -1 });

    return orders.map(order => ({
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        items: order.items.map(item => ({
            id: item._id.toString(),
            product: {
                id: (item.product as unknown as IProduct)._id.toString(),
                name: (item.product as unknown as IProduct).name,
                price: (item.product as unknown as IProduct).price,
                image: (item.product as unknown as IProduct).thumbnail
            },
            quantity: item.quantity,
            price: item.price,
            variant: item.variant,
            total: item.total
        })),
        shippingAddress: order.shippingAddress,
        paymentDetails: {
            method: order.paymentDetails.method,
            transactionId: order.paymentDetails.transactionId,
            amount: order.paymentDetails.amount,
            status: order.paymentDetails.status,
            paidAt: order.paymentDetails.paidAt
        },
        subtotal: order.subtotal,
        tax: order.tax,
        shippingCost: order.shippingCost,
        totalAmount: order.totalAmount,
        status: order.status,
        notes: order.notes,
        createdAt: order.createdAt
    }));
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: TOrderStatus['status']): Promise<TOrderResponse> => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    order.status = status;
    await order.save();

    return await getOrderById(orderId);
};

// Process Bikash payment
export const processBikashPayment = async (orderId: string, phone: string): Promise<{ success: boolean; message: string; paymentUrl?: string }> => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    if (order.paymentDetails.status === 'completed') {
        return { success: false, message: 'Payment already completed' };
    }

    const paymentResult = await createBikashPayment({
        amount: order.totalAmount,
        phone,
        orderId: order.orderNumber
    });

    if (paymentResult.success) {
        order.paymentDetails.transactionId = paymentResult.transactionId;
        await order.save();
    }

    return {
        success: paymentResult.success,
        message: paymentResult.message,
        paymentUrl: paymentResult.paymentUrl
    };
};

// Verify Bikash payment
export const verifyBikashPayment = async (orderId: string, transactionId: string): Promise<{ success: boolean; message: string }> => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    const verificationResult = await verifyPayment({
        transactionId,
        orderId: order.orderNumber
    });

    if (verificationResult.success) {
        order.paymentDetails.status = 'completed';
        order.paymentDetails.paidAt = new Date();
        order.status = 'confirmed';
        await order.save();

        // Send payment confirmation email
        await sendEmail({
            to: order.shippingAddress.phone,
            subject: `Payment Confirmed - ${order.orderNumber}`,
            template: 'payment-confirmation',
            data: {
                orderNumber: order.orderNumber,
                amount: order.totalAmount,
                transactionId
            }
        });
    }

    return {
        success: verificationResult.success,
        message: verificationResult.message
    };
}; 