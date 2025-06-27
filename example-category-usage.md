# Tree-Based Category System

This is a comprehensive tree-based category system that supports hierarchical categories with efficient querying and management.

## Features

- ✅ **Hierarchical Structure**: Parent-child relationships with unlimited depth
- ✅ **Ancestor Tracking**: Efficient ancestor path tracking for quick lookups
- ✅ **Level Management**: Automatic level calculation based on depth
- ✅ **Path Generation**: Automatic slug and path generation
- ✅ **Tree Operations**: Move, delete, and restructure categories
- ✅ **Performance Optimized**: Indexed fields for fast queries
- ✅ **Virtual Fields**: Children and siblings relationships
- ✅ **Search Capability**: Full-text search across categories

## Model Structure

```typescript
{
  name: string,           // Category name
  slug: string,          // URL-friendly slug (auto-generated)
  description?: string,  // Optional description
  parentId?: ObjectId,   // Reference to parent category
  ancestors: ObjectId[], // Array of ancestor IDs for efficient queries
  level: number,         // Depth level (0 = root, 1 = first child, etc.)
  path: string,          // Full path string for easy traversal
  isActive: boolean,     // Active/inactive status
  productCount: number,  // Number of products in this category
  childrenCount: number, // Number of direct children
  order: number         // Display order
}
```

## API Endpoints

### Create Category
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and gadgets",
  "parentId": null  // null for root category
}
```

### Create Subcategory
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Smartphones",
  "description": "Mobile phones and accessories",
  "parentId": "64f1a2b3c4d5e6f7g8h9i0j1"  // Electronics category ID
}
```

### Get Category Tree
```http
GET /api/categories/tree
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Electronics",
      "slug": "electronics",
      "level": 0,
      "children": [
        {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Smartphones",
          "slug": "smartphones",
          "level": 1,
          "parentId": "64f1a2b3c4d5e6f7g8h9i0j1",
          "children": []
        }
      ]
    }
  ]
}
```

### Get Categories by Level
```http
GET /api/categories/level/1
```

### Get Children of a Category
```http
GET /api/categories/64f1a2b3c4d5e6f7g8h9i0j1/children
```

### Get Ancestors of a Category
```http
GET /api/categories/64f1a2b3c4d5e6f7g8h9i0j2/ancestors
```

### Get Category with Full Path
```http
GET /api/categories/64f1a2b3c4d5e6f7g8h9i0j2/path
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "name": "Smartphones",
    "fullPath": "Electronics > Smartphones"
  }
}
```

### Move Category
```http
PATCH /api/categories/64f1a2b3c4d5e6f7g8h9i0j2/move
Content-Type: application/json

{
  "newParentId": "64f1a2b3c4d5e6f7g8h9i0j3"  // New parent category ID
}
```

### Search Categories
```http
GET /api/categories/search?query=phone
```

## Example Category Structure

```
Electronics (level 0)
├── Smartphones (level 1)
│   ├── iPhone (level 2)
│   ├── Samsung (level 2)
│   └── Android (level 2)
├── Laptops (level 1)
│   ├── Gaming (level 2)
│   └── Business (level 2)
└── Accessories (level 1)
    ├── Cases (level 2)
    └── Chargers (level 2)

Clothing (level 0)
├── Men (level 1)
│   ├── Shirts (level 2)
│   └── Pants (level 2)
└── Women (level 1)
    ├── Dresses (level 2)
    └── Shoes (level 2)
```

## Database Indexes

The system includes optimized indexes for:
- `parentId` - Fast child queries
- `ancestors` - Fast descendant queries
- `level` - Fast level-based queries
- `isActive` - Fast active category filtering
- `slug` - Fast slug-based lookups

## Benefits of This Approach

1. **Efficient Queries**: Ancestor array allows fast descendant lookups
2. **Flexible Structure**: Easy to move categories and restructure
3. **Performance**: Indexed fields for optimal query performance
4. **Scalability**: Handles deep hierarchies efficiently
5. **Maintainability**: Clear separation of concerns with service layer
6. **Type Safety**: Full TypeScript support with proper typing

## Usage in Code

```typescript
// Create a root category
const electronics = await CategoryService.createCategory({
  name: "Electronics",
  description: "Electronic devices"
});

// Create a subcategory
const smartphones = await CategoryService.createCategory({
  name: "Smartphones",
  description: "Mobile phones",
  parentId: electronics._id
});

// Get the full tree
const tree = await CategoryService.getCategoryTree();

// Get all descendants of Electronics
const descendants = await CategoryService.getDescendants(electronics._id);

// Move Smartphones to a new parent
await CategoryService.moveCategory(smartphones._id, newParentId);
``` 