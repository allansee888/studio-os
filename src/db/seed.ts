import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  
  // Permissions
  const permissionsData = [
    { name: "users.view", module: "Users" },
    { name: "users.create", module: "Users" },
    { name: "users.edit", module: "Users" },
    { name: "users.delete", module: "Users" },
    { name: "roles.view", module: "Roles" },
    { name: "roles.manage", module: "Roles" },
    { name: "settings.manage", module: "Settings" },
  ];

  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }

  // Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "Administrator" },
    update: {},
    create: {
      name: "Administrator",
      description: "Full access to all modules",
      isSystem: true,
    }
  });

  // Assign all permissions to Admin
  const allPermissions = await prisma.permission.findMany();
  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: p.id,
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: p.id,
      }
    });
  }

  // Admin User
  const passwordHash = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@studio.os" },
    update: {},
    create: {
      username: "admin",
      email: "admin@studio.os",
      passwordHash,
      firstName: "System",
      lastName: "Administrator",
      displayName: "System Admin",
      status: "Active",
      requiresPasswordChange: false,
    }
  });

  // Assign Admin role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    }
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
