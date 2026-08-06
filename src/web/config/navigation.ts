import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Scissors,
  Users,
  Settings,
  BarChart2,
  Receipt,
  Shield,
  UserCheck,
  FolderTree,
  Ruler,
  Tag,
} from "lucide-react";
import React from "react";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  badge?: string | number;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export const navigationConfig: NavGroup[] = [
  {
    id: "main",
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    id: "catalog",
    title: "Catalog",
    items: [
      { name: "Categories", href: "/categories", icon: FolderTree, permission: "catalog.category.view" },
      { name: "Brands", href: "/brands", icon: Tag, permission: "brand.view" },
      { name: "Units of Measure", href: "/units", icon: Ruler, permission: "unit.view" },
      { name: "Services", href: "/services", icon: Scissors, permission: "services:view" },
    ],
  },
  {
    id: "operations",
    title: "Sales & Operations",
    items: [
      { name: "Orders", href: "/orders", icon: ShoppingCart, permission: "orders:view" },
      { name: "Production", href: "/production", icon: Receipt, permission: "production:view" },
      { name: "Inventory", href: "/inventory", icon: Package, permission: "inventory:view" },
    ],
  },
  {
    id: "crm_staff",
    title: "CRM & Staff",
    items: [
      { name: "Customers", href: "/customers", icon: Users, permission: "customers:view" },
      { name: "Users", href: "/users", icon: UserCheck, permission: "users:view" },
      { name: "Roles & Permissions", href: "/roles", icon: Shield, permission: "roles:view" },
    ],
  },
  {
    id: "management",
    title: "Management",
    items: [
      { name: "Reports", href: "/reports", icon: BarChart2, permission: "reports:view" },
      { name: "Settings", href: "/settings", icon: Settings, permission: "settings:manage" },
    ],
  },
];
