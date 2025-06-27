import { Category } from "../models/category.model"
import { TCategory } from "../types/TCategory";
import { CheckCategory } from "../validations/category.validation";
import { Types } from 'mongoose';

export class CategoryService {
    // Create a new category
    static async createCategory(categoryData: any) {
        const category = new Category(categoryData);

        // If parentId is provided, update ancestors and level
        if (categoryData.parentId) {
            const parent = await Category.findById(categoryData.parentId);
            if (parent) {
                category.ancestors = [...(parent.ancestors || []), parent._id];
                category.level = (parent.level || 0) + 1;
            }
        }

        await category.save();

        // Update parent's children count
        if (categoryData.parentId) {
            await Category.findByIdAndUpdate(
                categoryData.parentId,
                { $inc: { childrenCount: 1 } }
            );
        }

        return category;
    }

    // Get category tree
    static async getCategoryTree() {
        const CategoryModel = Category as any;
        return await CategoryModel.getTree();
    }

    // Get categories by level
    static async getCategoriesByLevel(level: number) {
        return await Category.find({ level, isActive: true }).sort({ order: 1, name: 1 });
    }

    // Get children of a category
    static async getChildren(categoryId: string) {
        return await Category.find({
            parentId: categoryId,
            isActive: true
        }).sort({ order: 1, name: 1 });
    }

    // Get ancestors of a category
    static async getAncestors(categoryId: string) {
        const category = await Category.findById(categoryId);
        if (!category || !category.ancestors) return [];

        return await Category.find({
            _id: { $in: category.ancestors },
            isActive: true
        }).sort({ level: 1 });
    }

    // Get descendants of a category
    static async getDescendants(categoryId: string) {
        return await Category.find({
            ancestors: categoryId,
            isActive: true
        }).sort({ level: 1, order: 1, name: 1 });
    }

    // Move category to new parent
    static async moveCategory(categoryId: string, newParentId: string | null) {
        const category = await Category.findById(categoryId);
        if (!category) throw new Error('Category not found');

        const oldParentId = category.parentId;

        // Update parent's children count
        if (oldParentId) {
            await Category.findByIdAndUpdate(
                oldParentId,
                { $inc: { childrenCount: -1 } }
            );
        }

        if (newParentId) {
            const newParent = await Category.findById(newParentId);
            if (!newParent) throw new Error('New parent category not found');

            category.parentId = newParentId;
            category.ancestors = [...(newParent.ancestors || []), newParent._id];
            category.level = (newParent.level || 0) + 1;

            await Category.findByIdAndUpdate(
                newParentId,
                { $inc: { childrenCount: 1 } }
            );
        } else {
            category.parentId = undefined;
            category.ancestors = [];
            category.level = 0;
        }

        await category.save();

        // Update descendants' ancestors and levels
        await this.updateDescendants(categoryId, category.ancestors || [], category.level || 0);

        return category;
    }

    // Update descendants after moving a category
    private static async updateDescendants(categoryId: string, newAncestors: any[], newLevel: number) {
        const descendants = await Category.find({ ancestors: categoryId });

        for (const descendant of descendants) {
            const descendantAncestors = [...newAncestors, categoryId];
            const descendantLevel = newLevel + 1;

            await Category.findByIdAndUpdate(descendant._id, {
                ancestors: descendantAncestors,
                level: descendantLevel
            });

            // Recursively update this descendant's descendants
            await this.updateDescendants(descendant._id.toString(), descendantAncestors, descendantLevel);
        }
    }

    // Delete category and move children to parent
    static async deleteCategory(categoryId: string) {
        const category = await Category.findById(categoryId);
        if (!category) throw new Error('Category not found');

        // Move children to parent
        const children = await Category.find({ parentId: categoryId });
        for (const child of children) {
            child.parentId = category.parentId;
            child.ancestors = category.ancestors || [];
            child.level = category.level || 0;
            await child.save();
        }

        // Update parent's children count
        if (category.parentId) {
            await Category.findByIdAndUpdate(
                category.parentId,
                { $inc: { childrenCount: -1 } }
            );
        }

        // Delete the category
        await Category.findByIdAndDelete(categoryId);

        return { message: 'Category deleted successfully' };
    }

    // Get category with full path
    static async getCategoryWithPath(categoryId: string) {
        const category = await Category.findById(categoryId);
        if (!category) return null;

        const categoryDoc = category as any;
        const fullPath = await categoryDoc.getFullPath();
        return { ...category.toObject(), fullPath };
    }

    // Search categories
    static async searchCategories(query: string) {
        return await Category.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ],
            isActive: true
        }).sort({ name: 1 });
    }

    // Update product count
    static async updateProductCount(categoryId: string, increment: number = 1) {
        return await Category.findByIdAndUpdate(
            categoryId,
            { $inc: { productCount: increment } },
            { new: true }
        );
    }
}