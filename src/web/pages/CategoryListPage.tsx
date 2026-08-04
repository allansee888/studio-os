import React, { useState } from "react";
import { useCategories } from "../hooks/category.hooks";
import { usePermission } from "../hooks/usePermission";
import { Category } from "../../packages/types/domain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../packages/ui/Table";
import { Button } from "../../packages/ui/Button";
import { Badge } from "../../packages/ui/Badge";
import { Breadcrumbs } from "../../packages/ui/Breadcrumbs";
import { Input } from "../../packages/ui/Input";
import { Select } from "../../packages/ui/Select";
import { EmptyState } from "../../packages/ui/EmptyState";
import { CategoryDialog } from "../components/categories/CategoryDialog";
import {
  FolderTree,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowUpDown,
  FolderOpen,
} from "lucide-react";

export function CategoryListPage() {
  const { hasAnyPermission } = usePermission();
  const canView = hasAnyPermission(["category.view", "catalog.category.view"]);

  // State for server-side search, filtering, sorting, and pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [parentFilter, setParentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "code" | "displayOrder" | "createdAt">("displayOrder");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Notice/action feedback state for placeholder handlers
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Construct Query Parameters for Category List Hook
  const queryParams = {
    page,
    limit,
    search: search.trim() || undefined,
    isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
    parentId: parentFilter === "root" ? null : parentFilter !== "all" ? parentFilter : undefined,
    sortBy,
    sortOrder,
  };

  // Main React Query hook for Categories
  const { data, isLoading, isError, error, refetch, isFetching } = useCategories(queryParams, {
    enabled: canView,
  });

  // Fetch parent categories for dropdown selector
  const { data: parentOptionsData } = useCategories({ limit: 1000 }, { enabled: canView });
  const parentOptions = parentOptionsData?.items || [];

  const categories = data?.items || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Trigger feedback banner for placeholder actions
  const triggerPlaceholderFeedback = (message: string) => {
    setActionFeedback(message);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Handlers
  const handleNewCategory = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleView = (category: Category) => {
    triggerPlaceholderFeedback(`Action Placeholder: Viewing category "${category.name}" (${category.code})`);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    triggerPlaceholderFeedback(`Action Placeholder: Deleting category "${category.name}" (${category.code})`);
  };

  const toggleSort = (field: "name" | "code" | "displayOrder" | "createdAt") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const formatDate = (dateVal?: string | Date) => {
    if (!dateVal) return "—";
    try {
      return new Date(dateVal).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return String(dateVal);
    }
  };

  if (!canView) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400">
          You do not have permission (`category.view`) to view product categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast / Action Feedback Banner */}
      {actionFeedback && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium flex items-center gap-2 animate-in fade-in-50">
          <FolderTree className="w-5 h-5 text-blue-400 dark:text-blue-600" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumbs items={[{ label: "Catalog", href: "/categories" }, { label: "Categories" }]} />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            Categories
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage product and service categories, display order, and hierarchy.
          </p>
        </div>

        <Button onClick={handleNewCategory} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Category
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by code or name..."
              className="pl-9"
            />
          </div>

          {/* Active/Inactive Status Filter */}
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-36"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>

          {/* Parent Category Filter */}
          <Select
            value={parentFilter}
            onChange={(e) => {
              setParentFilter(e.target.value);
              setPage(1);
            }}
            className="w-48"
          >
            <option value="all">All Parents</option>
            <option value="root">Root Only</option>
            {parentOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Refresh Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh Category List"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline ml-1.5">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>{error?.message || "Failed to load categories"}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32 cursor-pointer" onClick={() => toggleSort("code")}>
                <div className="flex items-center gap-1">
                  Category Code <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                <div className="flex items-center gap-1">
                  Category Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead className="w-32 text-center cursor-pointer" onClick={() => toggleSort("displayOrder")}>
                <div className="flex items-center justify-center gap-1">
                  Display Order <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-36 cursor-pointer" onClick={() => toggleSort("createdAt")}>
                <div className="flex items-center gap-1">
                  Created Date <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead className="text-right w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-8 text-center">
                  <EmptyState
                    title="No categories found"
                    description="No categories match the selected search criteria or filters."
                    icon={<FolderOpen className="w-8 h-8 text-slate-400" />}
                    action={
                      <Button size="sm" onClick={handleNewCategory} className="mt-2">
                        <Plus className="w-4 h-4 mr-1" /> Add Category
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  {/* Category Code */}
                  <TableCell className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {cat.code}
                  </TableCell>

                  {/* Category Name */}
                  <TableCell>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {cat.name}
                      </span>
                      {cat.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Parent Category */}
                  <TableCell>
                    {cat.parent ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <FolderTree className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cat.parent.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Root</span>
                    )}
                  </TableCell>

                  {/* Display Order */}
                  <TableCell className="text-center font-mono text-xs font-medium">
                    {cat.displayOrder ?? 0}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={cat.isActive ? "success" : "default"}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  {/* Created Date */}
                  <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(cat.createdAt)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleView(cat)}
                        title="View Category"
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(cat)}
                        title="Edit Category"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        title="Delete Category"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Server-Side Pagination Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-slate-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {categories.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.total}</span> categories
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span>Per page:</span>
              <Select
                value={limit.toString()}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="w-16 text-xs"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-2 text-xs font-medium">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Create/Edit Dialog */}
      <CategoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        category={selectedCategory}
        onSuccess={(msg) => {
          triggerPlaceholderFeedback(msg);
          refetch();
        }}
      />
    </div>
  );
}

export default CategoryListPage;
