import { model, Schema, Types } from "mongoose";
import { TCategory } from "../types/TCategory";

const categorySchema = new Schema<TCategory>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    slug: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    parentId: {
        ref: "Category",
        type: Types.ObjectId,
        default: null
    },
    ancestors: [{
        ref: "Category",
        type: Types.ObjectId
    }],
    level: {
        type: Number,
        default: 0,
        min: 0
    },
    path: {
        type: String,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    productCount: {
        type: Number,
        default: 0,
        min: 0
    },
    childrenCount: {
        type: Number,
        default: 0,
        min: 0
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
categorySchema.index({ parentId: 1 });
categorySchema.index({ ancestors: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ slug: 1 });

// Virtual for children
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentId'
});

// Virtual for siblings
categorySchema.virtual('siblings', {
    ref: 'Category',
    localField: 'parentId',
    foreignField: 'parentId'
});

// Pre-save middleware to generate slug and path
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    // Generate path based on ancestors
    if (this.ancestors && this.ancestors.length > 0) {
        this.path = this.ancestors.join('/') + '/' + this._id;
    } else {
        this.path = this._id.toString();
    }

    next();
});

// Method to get full path with names
categorySchema.methods.getFullPath = async function () {
    const Category = this.constructor as any;
    const pathParts: string[] = [];

    if (this.ancestors && this.ancestors.length > 0) {
        const ancestors = await Category.find({ _id: { $in: this.ancestors } }).select('name');
        pathParts.push(...ancestors.map((a: any) => a.name));
    }

    pathParts.push(this.name);
    return pathParts.join(' > ');
};

// Static method to get tree structure
categorySchema.statics.getTree = async function () {
    const categories = await this.find({ isActive: true }).sort({ order: 1, name: 1 });
    return buildTree(categories);
};

// Helper function to build tree
function buildTree(categories: any[], parentId: string | null = null): any[] {
    const tree: any[] = [];

    for (const category of categories) {
        if (category.parentId?.toString() === parentId?.toString()) {
            const children = buildTree(categories, category._id.toString());
            if (children.length > 0) {
                category.children = children;
            }
            tree.push(category);
        }
    }
    return tree;
}

export const Category = model("Category", categorySchema);