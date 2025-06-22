import fs from 'fs';
import path from 'path';
import { Express } from 'express';

export const autoLoadRoutes = (app: Express) => {
  const routesPath = path.join(__dirname, '../routes');
  fs.readdirSync(routesPath).forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const route = require(path.join(routesPath, file));
      const routeName = '/' + file.replace(/\.ts$|\.js$/, '');
      app.use(routeName, route.default || route);
    }
  });
};
