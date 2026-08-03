import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { loggingMiddleware, errorMiddleware } from "./src/api/middlewares/index.ts";
import { v1Router } from "./src/api/v1/routes/index.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // Logging
  app.use(loggingMiddleware);

  // API v1 Routes
  app.use('/api/v1', v1Router);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudioOS Server running on port ${PORT}`);
  });
}

startServer();
