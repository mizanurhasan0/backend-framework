import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem extends Document {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    variant?: string;
}

export interface ICart extends Document {
    user: mongoose.Types.ObjectId;
    items: ICartItem[];
    totalAmount: number;
    totalItems: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
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
    }
});

const cartSchema = new Schema<ICart>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalItems: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function (next) {
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    next();
});

export const Cart = mongoose.model<ICart>('Cart', cartSchema); 