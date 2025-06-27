import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    sku: string;
    price: number;
    sale_price?: number;
    temp_price?: number;
    category: mongoose.Types.ObjectId;
    thumbnail: string;
    images: string[];
    stock: number;
    status: string;
    max_per_order?: number;
    barcode?: string;
    free_shipping: boolean;
    is_new: boolean;
    customFields: Array<{
        fieldId: mongoose.Types.ObjectId;
        value: any;
    }>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    sale_price: { type: Number, default: null },
    temp_price: { type: Number, default: null },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    thumbnail: { type: String, required: true },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0 },
    status: { type: String, required: true },
    max_per_order: { type: Number, default: null },
    barcode: { type: String, default: null },
    free_shipping: { type: Boolean, default: false },
    is_new: { type: Boolean, default: false },
    customFields: [{
        fieldId: { type: Schema.Types.ObjectId, ref: "CustomField" },
        value: Schema.Types.Mixed
    }],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

productSchema.methods.toJSON = function () {
    return JSON.parse(JSON.stringify(this.toObject()).replace(/_id/g, 'id'));
};

export const Product = mongoose.model<IProduct>("Product", productSchema);