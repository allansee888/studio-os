import { navigationConfig } from "../config/navigation";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export function getBreadcrumbsForPath(pathname: string): BreadcrumbItem[] {
  if (pathname === "/" || pathname === "") {
    return [{ label: "Dashboard" }];
  }

  // Search in navigation groups
  for (const group of navigationConfig) {
    for (const item of group.items) {
      if (item.href !== "/" && (pathname === item.href || pathname.startsWith(`${item.href}/`))) {
        return [
          { label: group.title },
          { label: item.name, href: pathname === item.href ? undefined : item.href },
        ];
      }
    }
  }

  // Fallback for custom or status paths
  const parts = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];
  let currentPath = "";

  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const formattedLabel = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
    const isLast = index === parts.length - 1;
    items.push({
      label: formattedLabel,
      href: isLast ? undefined : currentPath,
    });
  });

  return items;
}
