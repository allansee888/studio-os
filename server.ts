import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import { config } from "./src/config/index.ts";
import { errorMiddleware } from "./src/api/middlewares/index.ts";
import { v1Router } from "./src/api/v1/routes/index.ts";
import { healthRouter } from "./src/api/routes/health.ts";
import { prisma } from "./src/db/prisma.ts";

async function startServer() {
  const app = express();
  const PORT = config.PORT;

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for Vite dev server / embedded preview compatibility
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: [config.CLIENT_URL, "http://localhost:3000"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  // Response compression
  app.use(compression());

  // Request logging
  app.use(morgan(config.NODE_ENV === "production" ? "combined" : "dev"));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check routes (/api/health)
  app.use("/api/health", healthRouter);

  // API v1 Routes
  app.use("/api/v1", v1Router);

  // Vite middleware for development
  if (config.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error handling
  app.use(errorMiddleware);

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`[StudioOS] Server started on port ${PORT}`);
    console.log(`[StudioOS] Environment: ${config.NODE_ENV}`);
    console.log(`[StudioOS] Client URL: ${config.CLIENT_URL}`);

    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`[StudioOS] Database connected successfully`);
    } catch (err) {
      console.error(`[StudioOS] Database connection failed:`, err instanceof Error ? err.message : err);
    }
  });
}

startServer();


