import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem extends Document {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    variant?: string;
    total: number;
}

export interface IShippingAddress {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
}

export interface IPaymentDetails {
    method: 'bikash' | 'cash_on_delivery' | 'bank_transfer';
    transactionId?: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paidAt?: Date;
}

export interface IOrder extends Document {
    orderNumber: string;
    user: mongoose.Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: IShippingAddress;
    paymentDetails: IPaymentDetails;
    subtotal: number;
    tax: number;
    shippingCost: number;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    variant: {
        type: String,
        default: null
    },
    total: {
        type: Number,
        required: true,
        min: 0
    }
});

const shippingAddressSchema = new Schema<IShippingAddress>({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        default: 'Bangladesh'
    }
});

const paymentDetailsSchema = new Schema<IPaymentDetails>({
    method: {
        type: String,
        enum: ['bikash', 'cash_on_delivery', 'bank_transfer'],
        required: true
    },
    transactionId: {
        type: String,
        default: null
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paidAt: {
        type: Date,
        default: null
    }
});

const orderSchema = new Schema<IOrder>({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentDetails: paymentDetailsSchema,
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    shippingCost: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    notes: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function (next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `ORD${year}${month}${random}`;
    }
    next();
});

export const Order = mongoose.model<IOrder>('Order', orderSchema); 