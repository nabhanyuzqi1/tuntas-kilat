import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes-supabase";

function log(message: string, source = "express") {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [${source}] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint for Firebase App Hosting
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'tuntas-kilat-api' 
  });
});

// Root endpoint handled by Vite in development, static files in production

(async () => {
  // Register API routes first, before any static file handling
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup development vs production static serving
  if (process.env.NODE_ENV === "development") {
    try {
      const { setupVite } = await import("./vite");
      await setupVite(app, server);
    } catch (error) {
      log("Vite not available, serving in API-only mode");
    }
  } else {
    // Production: serve static files without vite dependencies
    const path = await import("path");
    const fs = await import("fs");
    
    // Try to serve static files from dist/public
    const staticPath = path.resolve(process.cwd(), "dist", "public");
    const indexPath = path.join(staticPath, "index.html");
    
    if (fs.existsSync(indexPath)) {
      log(`Static files served from: ${staticPath}`);
      app.use(express.static(staticPath));
      
      // Serve index.html for all non-API routes
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
          return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.sendFile(indexPath);
      });
    } else {
      log("Static files not available, running in API-only mode");
      // Fallback for production without static files
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
          return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.status(200).json({
          message: 'Tuntas Kilat API Server',
          mode: 'API-only',
          health: '/health',
          services: '/api/services'
        });
      });
    }
  }

  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on localhost:${port}`);
  });
})();