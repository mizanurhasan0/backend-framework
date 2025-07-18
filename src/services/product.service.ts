import { Product, IProduct } from '../models/product.model';
import { Category } from '../models/category.model';
import { Types } from 'mongoose';

export interface ProductFilters {
    category?: string;
    subCategory?: string;
    brand?: string;
    status?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isNewProduct?: boolean;
    isBestSeller?: boolean;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    search?: string;
    tags?: string[];
    color?: string;
    size?: string;
}

export interface ProductSort {
    field: string;
    order: 'asc' | 'desc';
}

export interface ProductPagination {
    page: number;
    limit: number;
}

export class ProductService {
    // Create a new product
    static async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
        const product = new Product(productData);
        await product.save();

        // Update category product count
        if (product.category) {
            await Category.findByIdAndUpdate(
                product.category,
                { $inc: { productCount: 1 } }
            );
        }

        return product;
    }

    // Get products with advanced filtering
    static async getProducts(
        filters: ProductFilters = {},
        sort: ProductSort = { field: 'createdAt', order: 'desc' },
        pagination: ProductPagination = { page: 1, limit: 20 }
    ) {
        const skip = (pagination.page - 1) * pagination.limit;
        const query: any = {};

        // Apply filters
        if (filters.category) {
            query.category = new Types.ObjectId(filters.category);
        }

        if (filters.subCategory) {
            query.subCategory = new Types.ObjectId(filters.subCategory);
        }

        if (filters.brand) {
            query.brand = { $regex: filters.brand, $options: 'i' };
        }

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }

        if (filters.isFeatured !== undefined) {
            query.isFeatured = filters.isFeatured;
        }

        if (filters.isNewProduct !== undefined) {
            query.isNewProduct = filters.isNewProduct;
        }

        if (filters.isBestSeller !== undefined) {
            query.isBestSeller = filters.isBestSeller;
        }

        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            query.price = {};
            if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
            if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
        }

        if (filters.inStock) {
            query.stock = { $gt: 0 };
        }

        if (filters.tags && filters.tags.length > 0) {
            query.tags = { $in: filters.tags.map(tag => tag.toLowerCase()) };
        }

        if (filters.color) {
            query.color = { $regex: filters.color, $options: 'i' };
        }

        if (filters.size) {
            query.size = { $regex: filters.size, $options: 'i' };
        }

        // Text search
        if (filters.search) {
            query.$text = { $search: filters.search };
        }

        // Build sort object
        const sortObj: any = {};
        sortObj[sort.field] = sort.order === 'asc' ? 1 : -1;
        console.log({ query });
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug')
            .sort(sortObj)
            .skip(skip)
            .limit(pagination.limit)
            .lean();
        const total = await Product.countDocuments(query);

        return {
            products,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            }
        };
    }

    // Get product by ID
    static async getProductById(productId: string): Promise<IProduct | null> {
        return await Product.findById(productId)
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug')
            .populate('customFields.fieldId', 'name fieldType options');
    }

    // Get product by slug
    static async getProductBySlug(slug: string): Promise<IProduct | null> {
        return await Product.findOne({ slug, isActive: true })
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug')
            .populate('customFields.fieldId', 'name fieldType options');
    }

    // Update product
    static async updateProduct(productId: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
        const product = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'name slug')
            .populate('subCategory', 'name slug');

        return product;
    }

    // Delete product (soft delete)
    static async deleteProduct(productId: string): Promise<boolean> {
        const product = await Product.findById(productId);
        if (!product) return false;

        // Soft delete
        product.isDeleted = true;
        product.isActive = false;
        await product.save();

        // Update category product count
        if (product.category) {
            await Category.findByIdAndUpdate(
                product.category,
                { $inc: { productCount: -1 } }
            );
        }

        return true;
    }

    // Get featured products
    static async getFeaturedProducts(limit: number = 10): Promise<IProduct[]> {
        return await Product.find({ isFeatured: true, isActive: true })
            .populate('category', 'name slug')
            .sort({ totalSales: -1, averageRating: -1 })
            .limit(limit)
            .lean();
    }

    // Get new products
    static async getNewProducts(limit: number = 10): Promise<IProduct[]> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return await Product.find({
            createdAt: { $gte: thirtyDaysAgo },
            isActive: true
        })
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }

    // Get best sellers
    static async getBestSellers(limit: number = 10): Promise<IProduct[]> {
        return await Product.find({ isBestSeller: true, isActive: true })
            .populate('category', 'name slug')
            .sort({ totalSales: -1 })
            .limit(limit)
            .lean();
    }

    // Get products by category (including subcategories)
    static async getProductsByCategory(
        categoryId: string,
        includeSubcategories: boolean = true,
        pagination: ProductPagination = { page: 1, limit: 20 }
    ) {
        const skip = (pagination.page - 1) * pagination.limit;
        let query: any = { isActive: true };

        if (includeSubcategories) {
            // Get all subcategory IDs
            const subcategories = await Category.find({
                ancestors: categoryId
            }).select('_id');

            const categoryIds = [new Types.ObjectId(categoryId), ...subcategories.map(cat => cat._id)];
            query.$or = [
                { category: { $in: categoryIds } },
                { subCategory: { $in: categoryIds } }
            ];
        } else {
            query.$or = [
                { category: new Types.ObjectId(categoryId) },
                { subCategory: new Types.ObjectId(categoryId) }
            ];
        }

        const products = await Product.find(query)
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pagination.limit)
            .lean();

        const total = await Product.countDocuments(query);

        return {
            products,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            }
        };
    }

    // Search products
    static async searchProducts(
        query: string,
        pagination: ProductPagination = { page: 1, limit: 20 }
    ) {
        const skip = (pagination.page - 1) * pagination.limit;

        const products = await Product.find({
            $text: { $search: query },
            isActive: true
        })
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug')
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(pagination.limit)
            .lean();

        const total = await Product.countDocuments({
            $text: { $search: query },
            isActive: true
        });

        return {
            products,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            }
        };
    }

    // Update product stock
    static async updateStock(productId: string, quantity: number, operation: 'add' | 'subtract' = 'subtract'): Promise<boolean> {
        const update = operation === 'add'
            ? { $inc: { stock: quantity } }
            : { $inc: { stock: -quantity } };

        const result = await Product.findByIdAndUpdate(productId, update);
        return !!result;
    }

    // Increment view count
    static async incrementViewCount(productId: string): Promise<void> {
        await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } });
    }

    // Update sales count
    static async updateSalesCount(productId: string, quantity: number): Promise<void> {
        await Product.findByIdAndUpdate(productId, {
            $inc: {
                purchaseCount: quantity,
                totalSales: quantity,
                dailySales: quantity,
                weeklySales: quantity,
                monthlySales: quantity
            }
        });
    }

    // Get low stock products
    static async getLowStockProducts(limit: number = 50): Promise<IProduct[]> {
        return await Product.find({ lowStockAlert: true, isActive: true })
            .populate('category', 'name slug')
            .sort({ stock: 1 })
            .limit(limit)
            .lean();
    }

    // Get product statistics
    static async getProductStats() {
        const stats = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
                    averagePrice: { $avg: '$price' },
                    totalViews: { $sum: '$viewCount' },
                    totalSales: { $sum: '$totalSales' },
                    lowStockCount: {
                        $sum: { $cond: ['$lowStockAlert', 1, 0] }
                    }
                }
            }
        ]);

        return stats[0] || {
            totalProducts: 0,
            totalValue: 0,
            averagePrice: 0,
            totalViews: 0,
            totalSales: 0,
            lowStockCount: 0
        };
    }

    // Bulk update products
    static async bulkUpdateProducts(productIds: string[], updateData: Partial<IProduct>): Promise<number> {
        const result = await Product.updateMany(
            { _id: { $in: productIds } },
            updateData
        );
        return result.modifiedCount;
    }

    // Get products by brand
    static async getProductsByBrand(
        brand: string,
        pagination: ProductPagination = { page: 1, limit: 20 }
    ) {
        const skip = (pagination.page - 1) * pagination.limit;

        const products = await Product.find({
            brand: { $regex: brand, $options: 'i' },
            isActive: true
        })
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug')
            .sort({ totalSales: -1 })
            .skip(skip)
            .limit(pagination.limit)
            .lean();

        const total = await Product.countDocuments({
            brand: { $regex: brand, $options: 'i' },
            isActive: true
        });

        return {
            products,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            }
        };
    }

    // Get related products from the same category
    static async getRelatedProducts(
        productId: string,
        limit: number = 8
    ): Promise<IProduct[]> {
        // First get the product to find its category
        const product = await Product.findById(productId).select('category subCategory brand tags');

        if (!product) {
            return [];
        }

        // Build query to find related products
        const query: any = {
            _id: { $ne: new Types.ObjectId(productId) }, // Exclude the current product
            isActive: true
        };

        // Priority 1: Same category and subcategory
        if (product.category && product.subCategory) {
            query.$or = [
                {
                    category: product.category,
                    subCategory: product.subCategory
                },
                {
                    category: product.category
                },
                {
                    subCategory: product.subCategory
                }
            ];
        } else if (product.category) {
            query.category = product.category;
        } else if (product.subCategory) {
            query.subCategory = product.subCategory;
        }

        // If no category found, try to find by brand or tags
        if (!product.category && !product.subCategory) {
            const orConditions = [];

            if (product.brand) {
                orConditions.push({ brand: product.brand });
            }

            if (product.tags && product.tags.length > 0) {
                orConditions.push({ tags: { $in: product.tags } });
            }

            if (orConditions.length > 0) {
                query.$or = orConditions;
            }
        }

        return await Product.find(query)
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug')
            .sort({
                totalSales: -1,
                averageRating: -1,
                viewCount: -1
            })
            .limit(limit)
            .lean();
    }
} 