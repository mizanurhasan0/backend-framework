import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

export class CategoryController {
    // Create a new category
    static async createCategory(req: Request, res: Response) {
        try {
            const category = await CategoryService.createCategory(req.body);
            res.status(201).json({
                success: true,
                data: category
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get category tree
    static async getCategoryTree(req: Request, res: Response) {
        try {
            const tree = await CategoryService.getCategoryTree();
            res.json({
                success: true,
                data: tree
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get categories by level
    static async getCategoriesByLevel(req: Request, res: Response) {
        try {
            const level = parseInt(req.params.level);
            const categories = await CategoryService.getCategoriesByLevel(level);
            res.json({
                success: true,
                data: categories
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get children of a category
    static async getChildren(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            const children = await CategoryService.getChildren(categoryId);
            res.json({
                success: true,
                data: children
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get ancestors of a category
    static async getAncestors(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            const ancestors = await CategoryService.getAncestors(categoryId);
            res.json({
                success: true,
                data: ancestors
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get descendants of a category
    static async getDescendants(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            const descendants = await CategoryService.getDescendants(categoryId);
            res.json({
                success: true,
                data: descendants
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Move category to new parent
    static async moveCategory(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            const { newParentId } = req.body;
            const category = await CategoryService.moveCategory(categoryId, newParentId);
            res.json({
                success: true,
                data: category
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Delete category
    static async deleteCategory(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            const result = await CategoryService.deleteCategory(categoryId);
            res.json({
                success: true,
                message: result.message
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get category with full path
    static async getCategoryWithPath(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            const category = await CategoryService.getCategoryWithPath(categoryId);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            res.json({
                success: true,
                data: category
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Search categories
    static async searchCategories(req: Request, res: Response) {
        try {
            const { query } = req.query;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }
            const categories = await CategoryService.searchCategories(query);
            res.json({
                success: true,
                data: categories
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

}