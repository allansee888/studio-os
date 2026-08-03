import { Router } from "express";
import { prisma } from "../../../db/prisma";
import { authenticate } from "../../middlewares/auth";
import { requirePermission } from "../../middlewares/rbac";

const router = Router();
router.use(authenticate);

// Get all permissions
router.get("/", requirePermission("settings.manage"), async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { module: 'asc' }
    });
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
});

export default router;
