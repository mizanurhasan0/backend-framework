// src/utils/routeLoader.ts
import { Express } from 'express';
import { Router } from 'express';

// ✅ Static imports for speed & type safety
import authRoutes from '../routes/auth';
import userRoutes from '../routes/user';
import productRoutes from '../routes/product';
import categoryRoutes from '../routes/category';
import cartRoutes from '../routes/cart';
import orderRoutes from '../routes/order';
import roleRoutes from '../routes/role';

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
