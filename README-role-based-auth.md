# Role-Based Authentication System

A comprehensive role-based authentication system with JWT tokens, Google OAuth, and granular permission control.

## 🚀 Features

### Authentication & Authorization
- ✅ **JWT-based authentication** with access and refresh tokens
- ✅ **Google OAuth integration** for social login
- ✅ **Role-based access control (RBAC)** with granular permissions
- ✅ **Email verification** system
- ✅ **Password reset** functionality
- ✅ **Account lockout** protection (5 failed attempts = 2-hour lock)
- ✅ **Rate limiting** on authentication endpoints
- ✅ **HTTP-only cookies** for secure token storage

### User Management
- ✅ **User registration** with email verification
- ✅ **User profile management** (name, avatar, phone)
- ✅ **Password change** functionality
- ✅ **User activation/deactivation**
- ✅ **User search** and filtering
- ✅ **Pagination** support
- ✅ **User statistics** and analytics

### Role Management
- ✅ **Predefined roles** (Super Admin, Admin, Manager, Editor, Customer)
- ✅ **Custom role creation** with flexible permissions
- ✅ **Permission assignment** and removal
- ✅ **Role cloning** functionality
- ✅ **Default role** management
- ✅ **Role statistics** and user counts

### Security Features
- ✅ **Password hashing** with bcrypt
- ✅ **Input validation** with Zod schemas
- ✅ **SQL injection protection** with Mongoose
- ✅ **XSS protection** with proper sanitization
- ✅ **CSRF protection** with same-site cookies
- ✅ **Account lockout** after failed attempts

## 📋 Prerequisites

### Environment Variables
```env
# Database
MONGO_URI=mongodb://localhost:27017/your-database

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-10-chars

# Email (for verification and password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# App Name
APP_NAME=Your App Name

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Dependencies
```bash
npm install bcryptjs jsonwebtoken nodemailer @types/bcryptjs @types/nodemailer
```

## 🏗️ Architecture

### Models

#### User Model (`src/models/user.model.ts`)
```typescript
{
  name: string,                    // User's full name
  email: string,                   // Unique email address
  password?: string,               // Hashed password (optional for Google auth)
  avatar?: string,                 // Profile picture URL
  phone?: string,                  // Phone number
  role: ObjectId,                  // Reference to Role model
  permissions: string[],           // Array of permission strings
  isActive: boolean,               // Account status
  isEmailVerified: boolean,        // Email verification status
  emailVerificationToken?: string, // Email verification token
  passwordResetToken?: string,     // Password reset token
  lastLogin?: Date,                // Last login timestamp
  loginAttempts: number,           // Failed login attempts
  lockUntil?: Date,                // Account lock timestamp
  googleId?: string,               // Google OAuth ID
  googleEmail?: string,            // Google email
  refreshToken?: string            // JWT refresh token
}
```

#### Role Model (`src/models/role.model.ts`)
```typescript
{
  name: string,                    // Role name (unique)
  description: string,             // Role description
  permissions: string[],           // Array of permission strings
  isActive: boolean,               // Role status
  isDefault: boolean               // Default role flag
}
```

### Services

#### AuthService (`src/services/auth.service.ts`)
- User registration with email verification
- JWT token generation and validation
- Google OAuth authentication
- Password reset functionality
- Permission checking utilities

#### UserService (`src/services/user.service.ts`)
- User CRUD operations
- User search and filtering
- Role assignment
- Permission management
- User statistics

#### RoleService (`src/services/role.service.ts`)
- Role CRUD operations
- Permission management
- Predefined role creation
- Role statistics

### Controllers

#### AuthController (`src/controllers/auth.controller.ts`)
- Authentication endpoints
- Profile management
- Permission checking

#### UserController (`src/controllers/user.controller.ts`)
- User management endpoints
- User statistics
- Permission verification

#### RoleController (`src/controllers/role.controller.ts`)
- Role management endpoints
- Permission management
- System initialization

## 🔐 Permission System

### Available Permissions
```typescript
// User permissions
'user:read', 'user:create', 'user:update', 'user:delete'

// Category permissions
'category:read', 'category:create', 'category:update', 'category:delete', 'category:move'

// Product permissions
'product:read', 'product:create', 'product:update', 'product:delete'

// Order permissions
'order:read', 'order:create', 'order:update', 'order:delete', 'order:fulfill'

// Admin permissions
'admin:read', 'admin:create', 'admin:update', 'admin:delete'

// System permissions
'system:settings', 'system:backup', 'system:logs'
```

### Predefined Roles

#### Super Admin
- All permissions
- Full system access
- Can manage all users and roles

#### Admin
- Most permissions except system-level
- Can manage users, categories, products, orders
- Cannot access system settings

#### Manager
- Moderate permissions
- Can read users, manage categories and products
- Can fulfill orders

#### Editor
- Limited permissions
- Can update categories and products
- Can read orders

#### Customer (Default)
- Basic permissions
- Can read products and create orders

## 🛣️ API Endpoints

### Authentication Routes (`/auth`)

#### Public Routes
```http
POST /auth/register              # Register new user
POST /auth/login                 # User login
POST /auth/google                # Google OAuth
POST /auth/refresh               # Refresh JWT token
POST /auth/forgot-password       # Request password reset
POST /auth/reset-password        # Reset password
POST /auth/verify-email          # Verify email
POST /auth/resend-verification   # Resend verification email
```

#### Protected Routes
```http
POST /auth/logout                # Logout user
GET  /auth/profile               # Get user profile
PUT  /auth/profile               # Update user profile
PUT  /auth/change-password       # Change password
GET  /auth/permissions           # Get user permissions
GET  /auth/check-permission/:p   # Check specific permission
```

#### Admin Routes
```http
GET  /auth/available-permissions # Get all available permissions
POST /auth/initialize-system     # Initialize system with default roles
```

### User Management Routes (`/users`)

```http
# User CRUD
POST   /users                    # Create user (admin)
GET    /users                    # Get all users with pagination
GET    /users/:userId            # Get user by ID
PUT    /users/:userId            # Update user (admin)
DELETE /users/:userId            # Delete user (admin)

# User Status
PATCH  /users/:userId/activate   # Activate user
PATCH  /users/:userId/deactivate # Deactivate user

# User Role
PUT    /users/:userId/role       # Update user role

# User Queries
GET    /users/stats              # User statistics
GET    /users/search             # Search users
GET    /users/role/:roleId       # Get users by role

# Permission Checking
GET    /users/:userId/permissions           # Get user permissions
GET    /users/:userId/check-permission/:p   # Check specific permission
POST   /users/:userId/check-any-permission  # Check any of permissions
POST   /users/:userId/check-all-permissions # Check all permissions
```

### Role Management Routes (`/roles`)

```http
# Role CRUD
POST   /roles                    # Create role
GET    /roles                    # Get all roles
GET    /roles/:roleId            # Get role by ID
PUT    /roles/:roleId            # Update role
DELETE /roles/:roleId            # Delete role

# Role Queries
GET    /roles/with-users         # Get roles with user counts
GET    /roles/active             # Get active roles
GET    /roles/default            # Get default role
GET    /roles/stats              # Role statistics
GET    /roles/search             # Search roles
GET    /roles/permissions        # Get all available permissions
GET    /roles/by-permission/:p   # Get roles by permission

# Role Management
PATCH  /roles/:roleId/set-default # Set default role
POST   /roles/:roleId/clone      # Clone role

# Permission Management
GET    /roles/:roleId/permissions    # Get role permissions
PUT    /roles/:roleId/permissions    # Update role permissions
POST   /roles/:roleId/permissions    # Add permission to role
DELETE /roles/:roleId/permissions    # Remove permission from role

# System Management
POST   /roles/predefined/create  # Create predefined roles
```

## 🔧 Middleware

### Authentication Middleware
```typescript
import { authGuard, requirePermission, requireRole } from '../middlewares/authGuard';

// Basic authentication
router.use(authGuard);

// Permission-based access
router.get('/admin', requirePermission('admin:read'));

// Multiple permissions (all required)
router.post('/admin', requireAllPermissions(['admin:create', 'user:create']));

// Multiple permissions (any required)
router.get('/admin', requireAnyPermission(['admin:read', 'user:read']));

// Role-based access
router.get('/super-admin', requireRole('super_admin'));

// Multiple roles (any required)
router.get('/admin', requireAnyRole(['admin', 'super_admin']));
```

### Validation Middleware
```typescript
import { zodValidation } from '../middlewares/errorsMiddleware';
import { registerSchema } from '../validations/authValidation';

router.post('/register', zodValidation(registerSchema), controller.register);
```

## 🚀 Getting Started

### 1. Initialize the System
```bash
# First, create a super admin user or initialize the system
POST /auth/initialize-system
```

### 2. Create Default Roles
```bash
POST /roles/predefined/create
```

### 3. Register a Super Admin
```bash
POST /auth/register
{
  "name": "Super Admin",
  "email": "admin@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

### 4. Login and Get Tokens
```bash
POST /auth/login
{
  "email": "admin@example.com",
  "password": "SecurePass123"
}
```

### 5. Use the Access Token
```bash
# Include in Authorization header
Authorization: Bearer <access_token>

# Or use the refresh token to get a new access token
POST /auth/refresh
{
  "refreshToken": "<refresh_token>"
}
```

## 📝 Example Usage

### Creating a Custom Role
```bash
POST /roles
Authorization: Bearer <access_token>
{
  "name": "content_manager",
  "description": "Manages content and products",
  "permissions": [
    "product:read",
    "product:create",
    "product:update",
    "category:read",
    "category:create",
    "category:update"
  ],
  "isActive": true
}
```

### Assigning Role to User
```bash
PUT /users/:userId/role
Authorization: Bearer <access_token>
{
  "roleId": "role_id_here"
}
```

### Checking Permissions
```bash
GET /auth/check-permission/product:create
Authorization: Bearer <access_token>
```

## 🔒 Security Best Practices

1. **Use HTTPS** in production
2. **Set secure JWT secret** (minimum 10 characters)
3. **Implement rate limiting** on authentication endpoints
4. **Use HTTP-only cookies** for refresh tokens
5. **Validate all inputs** with Zod schemas
6. **Hash passwords** with bcrypt
7. **Implement account lockout** after failed attempts
8. **Use environment variables** for sensitive data
9. **Regular security audits** of permissions
10. **Monitor login attempts** and suspicious activity

## 🧪 Testing

### Test Authentication Flow
```bash
# 1. Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123","confirmPassword":"TestPass123"}'

# 2. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'

# 3. Use access token
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <access_token>"
```

## 📊 Database Indexes

The system includes optimized indexes for:
- User email and Google ID lookups
- Role name and default role queries
- User-role relationships
- Permission-based queries
- Active user filtering

## 🔄 Token Management

### Access Token
- **Expiration**: 15 minutes
- **Usage**: API authentication
- **Storage**: Memory/state management

### Refresh Token
- **Expiration**: 7 days
- **Usage**: Token renewal
- **Storage**: HTTP-only cookie

### Token Refresh Flow
1. Access token expires
2. Client calls `/auth/refresh` with refresh token
3. Server validates refresh token
4. New access and refresh tokens issued
5. Old refresh token invalidated

## 🎯 Future Enhancements

- [ ] **Two-factor authentication (2FA)**
- [ ] **OAuth providers** (Facebook, GitHub, etc.)
- [ ] **Session management** with Redis
- [ ] **Audit logging** for security events
- [ ] **Permission inheritance** in role hierarchy
- [ ] **API key management** for service accounts
- [ ] **Multi-tenancy** support
- [ ] **Advanced analytics** and reporting

## 📞 Support

For questions or issues:
1. Check the validation schemas in `src/validations/authValidation.ts`
2. Review the middleware implementations in `src/middlewares/authGuard.ts`
3. Examine the service layer in `src/services/`
4. Check the API documentation above

This role-based authentication system provides a solid foundation for secure, scalable applications with fine-grained access control. 