# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

### Server Configuration
```env
NODE_ENV=development
PORT=3000
```

### MongoDB Configuration
Choose one of the following MongoDB URI formats:

#### Local MongoDB
```env
MONGO_URI=mongodb://localhost:27017/your-database-name
```

#### MongoDB Atlas (Cloud)
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/your-database-name?retryWrites=true&w=majority
```

#### MongoDB with Authentication
```env
MONGO_URI=mongodb://username:password@localhost:27017/your-database-name?authSource=admin
```

### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long
JWT_REFRESH_SECRET=your-refresh-token-secret-key
```

### Email Configuration
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Logging
```env
LOG_LEVEL=info
```

### Frontend URL (for CORS)
```env
FRONTEND_URL=http://localhost:3000
```

## MongoDB Connection Troubleshooting

### Common Issues and Solutions

1. **"option buffermaxentries is not supported"**
   - This error occurs with newer MongoDB versions
   - The option has been removed from the configuration
   - Use `bufferCommands: false` instead

2. **Connection Timeout**
   - Check if MongoDB is running
   - Verify the URI format
   - Check network connectivity

3. **Authentication Failed**
   - Verify username and password
   - Check if the user has proper permissions
   - Ensure the authSource is correct

### Testing MongoDB Connection

The server will automatically test the MongoDB connection and provide detailed error information including:
- URI analysis (sanitized for security)
- Connection options being used
- Detailed error messages

### Performance Optimizations

The MongoDB connection is optimized for:
- Fast startup (5-second timeout)
- Connection pooling (10 max connections)
- Buffer optimization
- Compression enabled

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with your configuration

3. Start the server:
   ```bash
   npm run dev
   ```

4. Check the logs for connection status and performance metrics 