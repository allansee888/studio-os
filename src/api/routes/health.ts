import { Router } from "express";
import { prisma } from "../../db/prisma.ts";

export const healthRouter = Router();

healthRouter.get("/database", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: "healthy",
      database: "connected"
    });
  } catch (error) {
    console.error("[HealthCheck] Database connection failed:", error instanceof Error ? error.message : error);
    return res.status(503).json({
      status: "unhealthy",
      database: "disconnected"
    });
  }
});

healthRouter.get("/", (req, res) => {
  return res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});
