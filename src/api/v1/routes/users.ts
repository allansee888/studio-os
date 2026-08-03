import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../../db/prisma";
import { authenticate } from "../../middlewares/auth";
import { requirePermission } from "../../middlewares/rbac";

const router = Router();

router.use(authenticate);

// Get all users
router.get("/", requirePermission("users.view"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        employeeNumber: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        department: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        userRoles: {
          include: {
            role: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create user
router.post("/", requirePermission("users.create"), async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, department, roleIds } = req.body;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        department,
        createdBy: req.user.id,
        userRoles: {
          create: roleIds?.map((roleId: string) => ({ roleId })) || []
        }
      },
      include: {
        userRoles: { include: { role: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "User Created",
        entityType: "User",
        entityId: user.id,
        ipAddress: req.ip || req.socket.remoteAddress
      }
    });

    res.status(201).json({ id: user.id, username: user.username, email: user.email });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user
router.put("/:id", requirePermission("users.edit"), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, department, status, roleIds } = req.body;
    
    // First, update basic info
    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        department,
        status,
        updatedBy: req.user.id,
      }
    });

    // If roleIds provided, update roles
    if (roleIds) {
      // Delete existing roles
      await prisma.userRole.deleteMany({ where: { userId: id } });
      
      // Add new roles
      if (roleIds.length > 0) {
        await prisma.userRole.createMany({
          data: roleIds.map((roleId: string) => ({
            userId: id,
            roleId
          }))
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "User Updated",
        entityType: "User",
        entityId: user.id,
        ipAddress: req.ip || req.socket.remoteAddress
      }
    });

    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;
