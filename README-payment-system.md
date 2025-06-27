# 🛒 E-Commerce Payment & Order System

A comprehensive Bikash payment integration with cart and order management system built with TypeScript, Express, and MongoDB.

## 🚀 Features

### Cart Management
- ✅ Add/remove items from cart
- ✅ Update item quantities
- ✅ Cart validation and stock checking
- ✅ Cart summary and totals calculation
- ✅ Persistent cart storage

### Order Management
- ✅ Create orders from cart
- ✅ Order status tracking
- ✅ Shipping address management
- ✅ Order history and details
- ✅ Automatic stock updates

### Payment Integration
- ✅ Bikash payment gateway integration
- ✅ Payment verification and callbacks
- ✅ Multiple payment methods support
- ✅ Transaction tracking
- ✅ Payment confirmation emails

## 🏗️ Architecture

### Models
- **Cart**: Shopping cart with items and totals
- **Order**: Complete order with payment and shipping details
- **Product**: Product information with stock management

### Services
- **CartService**: Cart operations and validation
- **OrderService**: Order creation and management
- **PaymentService**: Bikash payment processing

### Controllers
- **CartController**: Cart API endpoints
- **OrderController**: Order and payment API endpoints

## 📋 API Endpoints

### Cart Endpoints
```
GET    /cart                    - Get user's cart
POST   /cart/add               - Add item to cart
PUT    /cart/update            - Update cart item
DELETE /cart/remove/:itemId    - Remove item from cart
DELETE /cart/clear             - Clear entire cart
GET    /cart/summary           - Get cart summary
```

### Order Endpoints
```
POST   /order                           - Create new order
GET    /order                           - Get user orders
GET    /order/:orderId                  - Get specific order
PATCH  /order/:orderId/status           - Update order status
POST   /order/:orderId/payment/bikash   - Process Bikash payment
POST   /order/:orderId/payment/verify   - Verify payment
POST   /order/payment/callback/bikash   - Bikash callback
```

## 💳 Bikash Payment Integration

### Configuration
Set these environment variables:
```env
BIKASH_API_URL=https://api.bikash.com
BIKASH_USERNAME=your_username
BIKASH_PASSWORD=your_password
BIKASH_APP_KEY=your_app_key
BIKASH_APP_SECRET=your_app_secret
BACKEND_URL=https://your-domain.com
```

### Payment Flow
1. **Create Order**: User creates order from cart
2. **Initiate Payment**: Call Bikash API to create payment
3. **User Payment**: User completes payment on Bikash
4. **Verify Payment**: Verify payment with Bikash API
5. **Update Order**: Mark order as paid and confirmed

### Payment Methods
- **Bikash**: Digital wallet payment
- **Cash on Delivery**: Pay on delivery
- **Bank Transfer**: Direct bank transfer

## 🔧 Installation & Setup

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Bikash Payment
BIKASH_API_URL=https://api.bikash.com
BIKASH_USERNAME=your_username
BIKASH_PASSWORD=your_password
BIKASH_APP_KEY=your_app_key
BIKASH_APP_SECRET=your_app_secret

# App
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

### 3. Run the Application
```bash
# Development
npm run dev

# Production
npm start
```

## 📝 Usage Examples

### Add Item to Cart
```javascript
const response = await fetch('/cart/add', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },
    body: JSON.stringify({
        productId: 'product_id_here',
        quantity: 2,
        variant: 'large'
    })
});
```

### Create Order
```javascript
const response = await fetch('/order', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },
    body: JSON.stringify({
        shippingAddress: {
            name: 'John Doe',
            phone: '01712345678',
            address: '123 Main Street, Dhaka',
            city: 'Dhaka',
            postalCode: '1200',
            country: 'Bangladesh'
        },
        paymentMethod: 'bikash',
        notes: 'Please deliver in the morning'
    })
});
```

### Process Bikash Payment
```javascript
const response = await fetch('/order/order_id/payment/bikash', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },
    body: JSON.stringify({
        phone: '01712345678'
    })
});
```

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Role-based access control
- Secure payment processing

### Validation
- Input validation with Joi
- Phone number validation for Bangladesh
- Address and postal code validation

### Error Handling
- Comprehensive error handling
- User-friendly error messages
- Logging for debugging

## 📊 Database Schema

### Cart Schema
```typescript
interface ICart {
    user: ObjectId;
    items: ICartItem[];
    totalAmount: number;
    totalItems: number;
    isActive: boolean;
}
```

### Order Schema
```typescript
interface IOrder {
    orderNumber: string;
    user: ObjectId;
    items: IOrderItem[];
    shippingAddress: IShippingAddress;
    paymentDetails: IPaymentDetails;
    subtotal: number;
    tax: number;
    shippingCost: number;
    totalAmount: number;
    status: OrderStatus;
}
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
- Unit tests for services
- Integration tests for API endpoints
- Payment flow testing

## 📈 Performance Optimizations

### Database
- Indexed queries for fast retrieval
- Efficient aggregation pipelines
- Connection pooling

### Caching
- Redis caching for frequently accessed data
- Cart data caching
- Product information caching

### API Optimization
- Pagination for large datasets
- Efficient data serialization
- Minimal database queries

## 🚀 Deployment

### Production Setup
1. Set production environment variables
2. Configure SSL certificates
3. Set up MongoDB Atlas or production database
4. Configure Bikash production credentials
5. Deploy to your preferred platform

### Docker Deployment
```bash
# Build image
docker build -t ecommerce-backend .

# Run container
docker run -p 3000:3000 ecommerce-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using TypeScript, Express, MongoDB, and Bikash Payment Gateway** 