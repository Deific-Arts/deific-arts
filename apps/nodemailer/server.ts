import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'fs';
import { Liquid } from 'liquidjs';

const app = express();
const PORT = process.env.PORT || 3000;

const viewsPath = path.join(__dirname, 'views');
console.log('Views path:', viewsPath);
console.log('Views directory exists:', fs.existsSync(viewsPath));

const engine = new Liquid({
  root: viewsPath,
  extname: '.liquid'
});

// Custom render function for Liquid templates
app.engine('liquid', engine.express());
app.set('views', viewsPath);
app.set('view engine', 'liquid');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Redirect trailing slashes (only for GET requests)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET' && req.path !== '/' && !req.path.endsWith('/') && !req.path.includes('.')) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path + '/' + query);
  } else {
    next();
  }
});

// CORS middleware for cross-domain requests
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Redirect from root to /test
app.get('/', (req: Request, res: Response) => {
  console.log('Redirecting from root to /test');
  res.redirect('/test');
});

// Dynamic route loading - automatically maps /routes/[folder] to /[folder]
const routesDir = path.join(__dirname, 'routes');

export async function loadRoutes() {
  // Read all directories in routes folder and mount them dynamically
  const routeDirs = fs.readdirSync(routesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory());

  for (const dirent of routeDirs) {
    const routeName = dirent.name;
    const routePath = path.join(routesDir, routeName);

    try {
      // Import the route module (try .ts for development, fall back to .cjs for production)
      const tsPath = `${routePath}/index.ts`;
      const cjsPath = `${routePath}/index.cjs`;
      const importPath = fs.existsSync(tsPath) ? tsPath : cjsPath;

      let router;
      if (fs.existsSync(tsPath)) {
        const routeModule = await import(importPath);
        router = routeModule.default || routeModule;
      } else {
        const routeModule = require(importPath);
        router = routeModule.default || routeModule;
      }

      console.log(`Router type:`, typeof router, router?.name);

      app.use(`/${routeName}`, (req: Request, res: Response, next: NextFunction) => {
        console.log(`[Route /${routeName}] ${req.method} ${req.url} (path: ${req.path})`);
        next();
      });
      app.use(`/${routeName}`, router);
      console.log(`✓ Mounted route: /${routeName} -> ${routePath}`);
    } catch (error) {
      console.error(`✗ Failed to mount route /${routeName}:`, error);
    }
  }
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler (must be registered after routes are loaded)
export function setup404Handler() {
  app.use('*', (req: Request, res: Response) => {
    console.log('[404 Handler]', req.method, req.url);
    res.status(404).json({ message: 'Route not found' });
  });
}

export { app, PORT };
