import { Request, Response } from 'express';
import { ProductService, ProductFilters, ProductSort, ProductPagination } from '../services/product.service';
import { IProduct } from '../models/product.model';

export class ProductController {
    // Create a new product
    static async createProduct(req: Request, res: Response) {

        try {
            const imageNames = (req.files as Express.Multer.File[])?.map((file: Express.Multer.File) => file.filename) || [];
            const product = await ProductService.createProduct({ ...req.body, images: imageNames });
            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get all products with filtering
    static async getProducts(req: Request, res: Response) {
        try {
            const {
                page = 1,
                limit = 20,
                sortField = 'createdAt',
                sortOrder = 'desc',
                category,
                subCategory,
                brand,
                status,
                isActive,
                isFeatured,
                isNewProduct,
                isBestSeller,
                minPrice,
                maxPrice,
                inStock,
                search,
                tags,
                color,
                size
            } = req.query;

            const filters: ProductFilters = {
                category: category as string,
                subCategory: subCategory as string,
                brand: brand as string,
                status: status as string,
                isActive: isActive === 'true',
                isFeatured: isFeatured === 'true',
                isNewProduct: isNewProduct === 'true',
                isBestSeller: isBestSeller === 'true',
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                inStock: inStock === 'true',
                search: search as string,
                tags: tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined,
                color: color as string,
                size: size as string
            };

            const sort: ProductSort = {
                field: sortField as string,
                order: sortOrder as 'asc' | 'desc'
            };

            const pagination: ProductPagination = {
                page: Number(page),
                limit: Number(limit)
            };

            const result = await ProductService.getProducts(filters, sort, pagination);

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get product by ID with related products
    static async getProductById(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const { includeRelated = 'true', relatedLimit = '8' } = req.query;

            const product = await ProductService.getProductById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Increment view count
            await ProductService.incrementViewCount(productId);

            // Get related products if requested
            let relatedProducts: IProduct[] = [];
            if (includeRelated === 'true') {
                relatedProducts = await ProductService.getRelatedProducts(
                    productId,
                    Number(relatedLimit)
                );
            }

            res.json({
                success: true,
                data: {
                    product,
                    relatedProducts: includeRelated === 'true' ? relatedProducts : undefined
                }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get product by slug with related products
    static async getProductBySlug(req: Request, res: Response) {
        try {
            const { slug } = req.params;
            const { includeRelated = 'true', relatedLimit = '8' } = req.query;

            const product = await ProductService.getProductBySlug(slug);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Increment view count
            await ProductService.incrementViewCount(product._id.toString());

            // Get related products if requested
            let relatedProducts: IProduct[] = [];
            if (includeRelated === 'true') {
                relatedProducts = await ProductService.getRelatedProducts(
                    product._id.toString(),
                    Number(relatedLimit)
                );
            }

            res.json({
                success: true,
                data: {
                    product,
                    relatedProducts: includeRelated === 'true' ? relatedProducts : undefined
                }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update product
    static async updateProduct(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const product = await ProductService.updateProduct(productId, req.body);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            res.json({
                success: true,
                message: 'Product updated successfully',
                data: product
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Delete product
    static async deleteProduct(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const deleted = await ProductService.deleteProduct(productId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get featured products
    static async getFeaturedProducts(req: Request, res: Response) {
        try {
            const { limit = 10 } = req.query;
            const products = await ProductService.getFeaturedProducts(Number(limit));

            res.json({
                success: true,
                data: products
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get new products
    static async getNewProducts(req: Request, res: Response) {
        try {
            const { limit = 10 } = req.query;
            const products = await ProductService.getNewProducts(Number(limit));

            res.json({
                success: true,
                data: products
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get best sellers
    static async getBestSellers(req: Request, res: Response) {
        try {
            const { limit = 10 } = req.query;
            const products = await ProductService.getBestSellers(Number(limit));

            res.json({
                success: true,
                data: products
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get products by category
    static async getProductsByCategory(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            const {
                page = 1,
                limit = 20,
                includeSubcategories = 'true'
            } = req.query;

            const result = await ProductService.getProductsByCategory(
                categoryId,
                includeSubcategories === 'true',
                { page: Number(page), limit: Number(limit) }
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Search products
    static async searchProducts(req: Request, res: Response) {
        try {
            const { query } = req.query;
            const { page = 1, limit = 20 } = req.query;

            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const result = await ProductService.searchProducts(
                query,
                { page: Number(page), limit: Number(limit) }
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update product stock
    static async updateStock(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const { quantity, operation = 'subtract' } = req.body;

            if (!quantity || typeof quantity !== 'number') {
                return res.status(400).json({
                    success: false,
                    message: 'Valid quantity is required'
                });
            }

            const updated = await ProductService.updateStock(productId, quantity, operation);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            res.json({
                success: true,
                message: 'Stock updated successfully'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get low stock products
    static async getLowStockProducts(req: Request, res: Response) {
        try {
            const { limit = 50 } = req.query;
            const products = await ProductService.getLowStockProducts(Number(limit));

            res.json({
                success: true,
                data: products
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get product statistics
    static async getProductStats(req: Request, res: Response) {
        try {
            const stats = await ProductService.getProductStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Bulk update products
    static async bulkUpdateProducts(req: Request, res: Response) {
        try {
            const { productIds, updateData } = req.body;

            if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Product IDs array is required'
                });
            }

            const updatedCount = await ProductService.bulkUpdateProducts(productIds, updateData);

            res.json({
                success: true,
                message: `${updatedCount} products updated successfully`,
                data: { updatedCount }
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get products by brand
    static async getProductsByBrand(req: Request, res: Response) {
        try {
            const { brand } = req.params;
            const { page = 1, limit = 20 } = req.query;

            const result = await ProductService.getProductsByBrand(
                brand,
                { page: Number(page), limit: Number(limit) }
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
} 