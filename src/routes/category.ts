import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';

const router = Router();

// Create a new category
router.post('/', CategoryController.createCategory);

// Get category tree
router.get('/tree', CategoryController.getCategoryTree);

// Get categories by level
router.get('/level/:level', CategoryController.getCategoriesByLevel);

// Get children of a category
router.get('/:categoryId/children', CategoryController.getChildren);

// Get ancestors of a category
router.get('/:categoryId/ancestors', CategoryController.getAncestors);

// Get descendants of a category
router.get('/:categoryId/descendants', CategoryController.getDescendants);

// Get category with full path
router.get('/:categoryId/path', CategoryController.getCategoryWithPath);


// Move category to new parent
router.patch('/:categoryId/move', CategoryController.moveCategory);

// Delete category
router.delete('/:categoryId', CategoryController.deleteCategory);

// Search categories
router.get('/search', CategoryController.searchCategories);

export default router; 