import 'dotenv';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs';
import { Liquid } from 'liquidjs';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(express.static(path.join(__dirname, 'public')));

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
  res.redirect('/test');
});

// Dynamic route loading - automatically maps /routes/[folder] to /[folder]
const routesDir = path.join(__dirname, 'routes');

async function loadRoutes() {
  // Read all directories in routes folder and mount them dynamically
  const routeDirs = fs.readdirSync(routesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory());

  for (const dirent of routeDirs) {
    const routeName = dirent.name;
    const routePath = path.join(routesDir, routeName);

    try {
      // Import the route module (try .ts for development, fall back to .js for production)
      const tsPath = `${routePath}/index.ts`;
      const jsPath = `${routePath}/index.js`;
      const importPath = fs.existsSync(tsPath) ? tsPath : jsPath;
      const routeModule = await import(`file://${importPath}`);
      app.use(`/${routeName}`, routeModule.default || routeModule);
      console.log(`✓ Mounted route: /${routeName} -> ${routePath}`);
    } catch (error) {
      console.error(`✗ Failed to mount route /${routeName}:`, error);
    }
  }
}

loadRoutes();

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

export { app, PORT };
