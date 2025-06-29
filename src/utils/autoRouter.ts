// src/utils/routeLoader.ts
import express, { Express } from 'express';
import { Router } from 'express';

// ✅ Static imports for speed & type safety
import authRoutes from '../routes/auth';
import userRoutes from '../routes/user';
import productRoutes from '../routes/product';
import categoryRoutes from '../routes/category';
import cartRoutes from '../routes/cart';
import orderRoutes from '../routes/order';
import roleRoutes from '../routes/role';
import path from 'path';
import { config } from '../config';

interface RouteConfig {
  name: string;
  prefix?: string;
  router: Router;
}

const routes: RouteConfig[] = [
  { name: 'auth', router: authRoutes },
  { name: 'user', router: userRoutes },
  { name: 'product', router: productRoutes },
  { name: 'category', router: categoryRoutes },
  { name: 'cart', router: cartRoutes },
  { name: 'order', router: orderRoutes },
  { name: 'role', router: roleRoutes },
];

export const fastRouteLoader = (app: Express): void => {
  console.log('🚀 Initializing routes...');

  //  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      memory: process.memoryUsage(),
    });
  });

  app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d',
    etag: true,
    setHeaders: (res, path) => {
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('X-Frame-Options', 'DENY');
    }
  }));
  // Optional test route
  app.get('/test', (_, res) => res.json({ status: 'ok', message: 'Test route is working' }));

  routes.forEach(({ name, prefix, router }) => {
    const basePath = `/${prefix || name}`;
    app.use(basePath, router);
    console.log(`✅ Mounted route: [${basePath}]`);
  });

  console.log(`🎉 All routes mounted: ${routes.length}`);
};

// Legacy function for backward compatibility
export const autoLoadRoutes = fastRouteLoader;
