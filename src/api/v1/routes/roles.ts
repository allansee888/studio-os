import { Router } from "express";
import { prisma } from "../../../db/prisma";
import { authenticate } from "../../middlewares/auth";
import { requirePermission } from "../../middlewares/rbac";

const router = Router();
router.use(authenticate);

// Get all roles
router.get("/", requirePermission("settings.manage"), async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: { permission: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

export default router;
