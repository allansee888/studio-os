import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { config } from "./src/config/index.ts";
import { loggingMiddleware, errorMiddleware } from "./src/api/middlewares/index.ts";
import { v1Router } from "./src/api/v1/routes/index.ts";
import { healthRouter } from "./src/api/routes/health.ts";
import { prisma } from "./src/db/prisma.ts";

async function startServer() {
  const app = express();
  const PORT = config.PORT;

  app.use(express.json());
  
  // Logging
  app.use(loggingMiddleware);

  // Health check routes (/api/health)
  app.use('/api/health', healthRouter);

  // API v1 Routes
  app.use('/api/v1', v1Router);

  // Vite middleware for development
  if (config.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
  
  // Error handling
  app.use(errorMiddleware);

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`[StudioOS] Server started on port ${PORT}`);
    console.log(`[StudioOS] Environment: ${config.NODE_ENV}`);

    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`[StudioOS] Database connected successfully`);
    } catch (err) {
      console.error(`[StudioOS] Database connection failed:`, err instanceof Error ? err.message : err);
    }
  });
}

startServer();

