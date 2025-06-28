import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;
    sku: string;
    barcode?: string;

    // Pricing
    price: number;
    salePrice?: number;
    tempPrice?: number;
    tempStartDate?: Date;
    tempEndDate?: Date;
    costPrice?: number;
    profitMargin?: number;

    // Inventory
    stock: number;
    minStock: number;
    maxStock: number;
    reservedStock: number;
    lowStockAlert: boolean;

    // Category & Organization
    category: Types.ObjectId;
    subCategory?: Types.ObjectId;
    brand?: string;
    tags: string[];

    // Media
    thumbnail: string;
    images: string[];
    videos?: string[];

    // Product Details
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    color?: string;
    size?: string;
    material?: string;

    // Status & Visibility
    status: 'active' | 'inactive' | 'draft' | 'archived';
    isActive: boolean;
    isFeatured: boolean;
    isNewProduct: boolean;
    isBestSeller: boolean;
    isArchived: boolean;
    isDraft: boolean;
    isDeleted: boolean;

    // SEO & Marketing
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];

    // Sales & Analytics
    viewCount: number;
    purchaseCount: number;
    averageRating: number;
    reviewCount: number;
    dailySales: number;
    weeklySales: number;
    monthlySales: number;
    totalSales: number;

    // Custom Fields
    customFields: Array<{
        fieldId: Types.ObjectId;
        value: any;
    }>;

    // Shipping
    freeShipping: boolean;
    shippingWeight?: number;
    maxPerOrder?: number;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;

    // Methods
    calculateProfitMargin(): number;
    isOnSale(): boolean;
    isLowStock(): boolean;
    getAvailableStock(): number;
    updateSalesCount(quantity: number): Promise<void>;
    incrementViewCount(): Promise<void>;
}

const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
        index: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    shortDescription: {
        type: String,
        maxlength: 500
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    barcode: {
        type: String,
        sparse: true,
        index: true
    },

    // Pricing
    price: {
        type: Number,
        required: true,
        min: 0,
        index: true
    },
    salePrice: {
        type: Number,
        min: 0,
        index: true
    },
    tempPrice: {
        type: Number,
        min: 0
    },
    tempStartDate: Date,
    tempEndDate: Date,
    costPrice: {
        type: Number,
        min: 0
    },
    profitMargin: {
        type: Number,
        min: 0,
        max: 100
    },

    // Inventory
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        index: true
    },
    minStock: {
        type: Number,
        default: 0,
        min: 0
    },
    maxStock: {
        type: Number,
        min: 0
    },
    reservedStock: {
        type: Number,
        default: 0,
        min: 0
    },
    lowStockAlert: {
        type: Boolean,
        default: false,
        index: true
    },

    // Category & Organization
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
        index: true
    },
    subCategory: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        index: true
    },
    brand: {
        type: String,
        trim: true,
        index: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],

    // Media
    thumbnail: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    videos: [{
        type: String
    }],

    // Product Details
    weight: {
        type: Number,
        min: 0
    },
    dimensions: {
        length: { type: Number, min: 0 },
        width: { type: Number, min: 0 },
        height: { type: Number, min: 0 }
    },
    color: {
        type: String,
        trim: true
    },
    size: {
        type: String,
        trim: true
    },
    material: {
        type: String,
        trim: true
    },

    // Status & Visibility
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive', 'draft', 'archived'],
        default: 'draft',
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    },
    isNewProduct: {
        type: Boolean,
        default: false,
        index: true
    },
    isBestSeller: {
        type: Boolean,
        default: false,
        index: true
    },
    isArchived: {
        type: Boolean,
        default: false,
        index: true
    },
    isDraft: {
        type: Boolean,
        default: false,
        index: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },

    // SEO & Marketing
    metaTitle: {
        type: String,
        maxlength: 60
    },
    metaDescription: {
        type: String,
        maxlength: 160
    },
    keywords: [{
        type: String,
        trim: true,
        lowercase: true
    }],

    // Sales & Analytics
    viewCount: {
        type: Number,
        default: 0,
        min: 0,
        index: true
    },
    purchaseCount: {
        type: Number,
        default: 0,
        min: 0,
        index: true
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        index: true
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    dailySales: {
        type: Number,
        default: 0,
        min: 0
    },
    weeklySales: {
        type: Number,
        default: 0,
        min: 0
    },
    monthlySales: {
        type: Number,
        default: 0,
        min: 0
    },
    totalSales: {
        type: Number,
        default: 0,
        min: 0,
        index: true
    },

    // Custom Fields
    customFields: [{
        fieldId: {
            type: Schema.Types.ObjectId,
            ref: "CustomField"
        },
        value: Schema.Types.Mixed
    }],

    // Shipping
    freeShipping: {
        type: Boolean,
        default: false
    },
    shippingWeight: {
        type: Number,
        min: 0
    },
    maxPerOrder: {
        type: Number,
        min: 1
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound indexes for efficient queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ status: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isNewProduct: 1, isActive: 1 });
productSchema.index({ isBestSeller: 1, isActive: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ tags: 1, isActive: 1 });
productSchema.index({ price: 1, isActive: 1 });
productSchema.index({ averageRating: 1, isActive: 1 });
productSchema.index({ totalSales: 1, isActive: 1 });
productSchema.index({ viewCount: 1, isActive: 1 });
productSchema.index({ createdAt: -1, isActive: 1 });

// Text index for search
productSchema.index({
    name: 'text',
    description: 'text',
    shortDescription: 'text',
    brand: 'text',
    tags: 'text',
    keywords: 'text'
});

// Pre-save middleware
productSchema.pre('save', function (next) {
    const doc = this as any;

    // Generate slug if not provided
    if (doc.isModified('name') && !doc.slug) {
        doc.slug = doc.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    // Calculate profit margin
    if (doc.costPrice && doc.price) {
        doc.profitMargin = ((doc.price - doc.costPrice) / doc.price) * 100;
    }

    // Check low stock alert
    if (doc.stock <= doc.minStock) {
        doc.lowStockAlert = true;
    } else {
        doc.lowStockAlert = false;
    }

    next();
});

// Instance methods
productSchema.methods.calculateProfitMargin = function (): number {
    if (!this.costPrice || !this.price) return 0;
    return ((this.price - this.costPrice) / this.price) * 100;
};

productSchema.methods.isOnSale = function (): boolean {
    if (this.salePrice && this.salePrice < this.price) return true;
    if (this.tempPrice && this.tempStartDate && this.tempEndDate) {
        const now = new Date();
        return now >= this.tempStartDate && now <= this.tempEndDate;
    }
    return false;
};

productSchema.methods.isLowStock = function (): boolean {
    return this.stock <= this.minStock;
};

productSchema.methods.getAvailableStock = function (): number {
    return Math.max(0, this.stock - this.reservedStock);
};

productSchema.methods.updateSalesCount = async function (quantity: number): Promise<void> {
    this.purchaseCount += quantity;
    this.totalSales += quantity;

    // Update daily, weekly, monthly sales (simplified - in production, use aggregation)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // This is a simplified approach - in production, you'd want to use aggregation pipelines
    // or separate collections for detailed analytics
    this.dailySales += quantity;
    this.weeklySales += quantity;
    this.monthlySales += quantity;

    await this.save();
};

productSchema.methods.incrementViewCount = async function (): Promise<void> {
    this.viewCount += 1;
    await this.save();
};

// Virtual for current price
productSchema.virtual('currentPrice').get(function (this: any) {
    if (this.isOnSale()) {
        if (this.tempPrice && this.tempStartDate && this.tempEndDate) {
            const now = new Date();
            if (now >= this.tempStartDate && now <= this.tempEndDate) {
                return this.tempPrice;
            }
        }
        return this.salePrice;
    }
    return this.price;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function (this: any) {
    if (!this.isOnSale()) return 0;
    const currentPrice = this.currentPrice;
    return Math.round(((this.price - currentPrice) / this.price) * 100);
});

// Static methods for efficient queries
productSchema.statics.findByCategory = function (categoryId: string, options: any = {}) {
    const query = { category: categoryId, isActive: true };
    return this.find(query)
        .sort(options.sort || { createdAt: -1 })
        .limit(options.limit || 20)
        .skip(options.skip || 0);
};

productSchema.statics.findFeatured = function (limit: number = 10) {
    return this.find({ isFeatured: true, isActive: true })
        .sort({ totalSales: -1, averageRating: -1 })
        .limit(limit);
};

productSchema.statics.findNew = function (limit: number = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.find({
        createdAt: { $gte: thirtyDaysAgo },
        isActive: true
    })
        .sort({ createdAt: -1 })
        .limit(limit);
};

productSchema.statics.findBestSellers = function (limit: number = 10) {
    return this.find({ isBestSeller: true, isActive: true })
        .sort({ totalSales: -1 })
        .limit(limit);
};

export const Product = mongoose.model<IProduct>("Product", productSchema); 