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
    { name: "catalog.category.view", module: "Catalog" },
    { name: "catalog.category.create", module: "Catalog" },
    { name: "catalog.category.update", module: "Catalog" },
    { name: "catalog.category.delete", module: "Catalog" },
    { name: "unit.view", module: "Catalog" },
    { name: "unit.create", module: "Catalog" },
    { name: "unit.update", module: "Catalog" },
    { name: "unit.delete", module: "Catalog" },
    { name: "orders.view", module: "Orders" },
    { name: "inventory.view", module: "Inventory" },
    { name: "services.view", module: "Services" },
    { name: "customers.view", module: "Customers" },
    { name: "production.view", module: "Production" },
    { name: "reports.view", module: "Reports" },
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

  // Seed Categories
  const rootCat1 = await prisma.category.upsert({
    where: { code: "CAT-PRINTING" },
    update: {},
    create: {
      code: "CAT-PRINTING",
      name: "Photo Printing",
      description: "Custom photo prints, enlargements, and canvases",
      displayOrder: 1,
      isActive: true,
    },
  });

  await prisma.category.upsert({
    where: { code: "CAT-IDPHOTOS" },
    update: { parentCategoryId: rootCat1.id },
    create: {
      code: "CAT-IDPHOTOS",
      name: "ID & Passport Photos",
      description: "Biometric and official government standard photos",
      parentCategoryId: rootCat1.id,
      displayOrder: 1,
      isActive: true,
    },
  });

  await prisma.category.upsert({
    where: { code: "CAT-FRAMES" },
    update: {},
    create: {
      code: "CAT-FRAMES",
      name: "Frames & Albums",
      description: "Picture frames, albums, and display cases",
      displayOrder: 2,
      isActive: true,
    },
  });

  await prisma.category.upsert({
    where: { code: "CAT-ELECTRONICS" },
    update: {},
    create: {
      code: "CAT-ELECTRONICS",
      name: "Electronics",
      description: "Camera gear, memory cards, and power accessories",
      displayOrder: 3,
      isActive: true,
    },
  });

  // Seed Units of Measure
  const defaultUnits = [
    { code: "UOM-PCS", name: "Piece", abbreviation: "pc", description: "Single individual unit", displayOrder: 1 },
    { code: "UOM-PACK", name: "Pack", abbreviation: "pack", description: "Package of multiple items", displayOrder: 2 },
    { code: "UOM-BOX", name: "Box", abbreviation: "box", description: "Box container", displayOrder: 3 },
    { code: "UOM-ROLL", name: "Roll", abbreviation: "roll", description: "Paper or film roll", displayOrder: 4 },
    { code: "UOM-SHEET", name: "Sheet", abbreviation: "sheet", description: "Flat sheet media", displayOrder: 5 },
    { code: "UOM-SET", name: "Set", abbreviation: "set", description: "Matching set or group", displayOrder: 6 },
    { code: "UOM-PAIR", name: "Pair", abbreviation: "pair", description: "Pair of 2 items", displayOrder: 7 },
    { code: "UOM-BOTTLE", name: "Bottle", abbreviation: "btl", description: "Liquid or chemical bottle", displayOrder: 8 },
  ];

  for (const uom of defaultUnits) {
    await prisma.unitOfMeasure.upsert({
      where: { code: uom.code },
      update: {},
      create: {
        ...uom,
        isActive: true,
      },
    });
  }

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
