import React, { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../packages/ui/Table";
import { Button } from "../../packages/ui/Button";
import { Badge } from "../../packages/ui/Badge";
import { Breadcrumbs } from "../../packages/ui/Breadcrumbs";
import { Input } from "../../packages/ui/Input";
import { Select } from "../../packages/ui/Select";
import { ConfirmDialog } from "../../packages/ui/ConfirmDialog";
import { usePermission } from "../hooks/usePermission";

import {
  FolderTree,
  List,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  FolderPlus,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react";

import { Category } from "../../packages/types/domain";
import { CategoryFormModal } from "../components/categories/CategoryFormModal";
import { CategoryDetailsModal } from "../components/categories/CategoryDetailsModal";
import { CategoryTreeView, TreeCategoryNode } from "../components/categories/CategoryTreeView";

export function Categories() {
  const { hasPermission } = usePermission();
  const canView = hasPermission("catalog.category.view");
  const canCreate = hasPermission("catalog.category.create");
  const canUpdate = hasPermission("catalog.category.update");
  const canDelete = hasPermission("catalog.category.delete");

  // View state: 'list' | 'tree'
  const [viewMode, setViewMode] = useState<"list" | "tree">("list");

  // List data & pagination
  const [categories, setCategories] = useState<Category[]>([]);
  const [treeCategories, setTreeCategories] = useState<TreeCategoryNode[]>([]);
  const [allCategoriesList, setAllCategoriesList] = useState<Category[]>([]); // For parent selector dropdown
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [parentFilter, setParentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("displayOrder");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState<any | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Show toast notification helper
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all categories for dropdown selector
  const fetchAllCategoriesList = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/categories?limit=1000");
      if (res.ok) {
        const data = await res.json();
        setAllCategoriesList(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load category dropdown items", err);
    }
  }, []);

  // Fetch category tree
  const fetchCategoryTree = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/categories/tree");
      if (res.ok) {
        const data = await res.json();
        setTreeCategories(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load category tree", err);
    }
  }, []);

  // Fetch categories list with filters and pagination
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      if (search.trim()) {
        params.append("search", search.trim());
      }
      if (statusFilter === "active") {
        params.append("isActive", "true");
      } else if (statusFilter === "inactive") {
        params.append("isActive", "false");
      }

      if (parentFilter === "root") {
        params.append("parentCategoryId", "null");
      } else if (parentFilter !== "all" && parentFilter) {
        params.append("parentCategoryId", parentFilter);
      }

      const res = await fetch(`/api/v1/categories?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load categories");
      }

      setCategories(data.items || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, statusFilter, parentFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (canView) {
      fetchCategories();
      fetchAllCategoriesList();
      fetchCategoryTree();
    }
  }, [fetchCategories, fetchAllCategoriesList, fetchCategoryTree, canView]);

  const handleCreateOpen = (parentId?: string) => {
    setEditingCategory(null);
    setDefaultParentId(parentId || null);
    setIsFormModalOpen(true);
  };

  const handleEditOpen = (category: Category) => {
    setEditingCategory(category);
    setDefaultParentId(null);
    setIsFormModalOpen(true);
  };

  const handleViewDetails = async (category: Category) => {
    try {
      const res = await fetch(`/api/v1/categories/${category.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCategoryDetails(data.data);
      } else {
        setSelectedCategoryDetails(category);
      }
    } catch (err) {
      setSelectedCategoryDetails(category);
    }
    setIsDetailsModalOpen(true);
  };

  const handleDeleteOpen = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      showToast("Category deleted successfully");
      setIsDeleteModalOpen(false);
      setDeletingCategory(null);
      fetchCategories();
      fetchAllCategoriesList();
      fetchCategoryTree();
    } catch (err: any) {
      showToast(err.message || "Failed to delete category", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    showToast(editingCategory ? "Category updated successfully" : "Category created successfully");
    fetchCategories();
    fetchAllCategoriesList();
    fetchCategoryTree();
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  if (!canView) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400">
          You do not have permission (`catalog.category.view`) to view catalog categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg text-white font-medium flex items-center gap-2 ${
            toastMessage.type === "error" ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumbs items={[{ label: "Catalog", href: "/categories" }, { label: "Categories" }]} />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            Product & Service Categories
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organize catalog items into hierarchical categories for photo printing, services, and inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List View
            </button>
            <button
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === "tree"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              Tree View
            </button>
          </div>

          {canCreate && (
            <Button onClick={() => handleCreateOpen()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filters bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by code, name, or description..."
              className="pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-36"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </Select>

          {viewMode === "list" && (
            <Select
              value={parentFilter}
              onChange={(e) => {
                setParentFilter(e.target.value);
                setPage(1);
              }}
              className="w-48"
            >
              <option value="all">All Parents</option>
              <option value="root">Top-Level Roots Only</option>
              {allCategoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchCategories();
              fetchCategoryTree();
            }}
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={fetchCategories}>
            Retry
          </Button>
        </div>
      )}

      {/* Main Content: List View vs Tree View */}
      {viewMode === "list" ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32 cursor-pointer" onClick={() => toggleSort("code")}>
                  <div className="flex items-center gap-1">
                    Code <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                  <div className="flex items-center gap-1">
                    Category Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead>Parent Category</TableHead>
                <TableHead className="w-28 text-center cursor-pointer" onClick={() => toggleSort("displayOrder")}>
                  <div className="flex items-center justify-center gap-1">
                    Order <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="w-24 text-center">Items</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="text-right w-36">Actions</TableHead>
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
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <FolderTree className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    No categories found matching your filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat: any) => (
                  <TableRow key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {cat.code}
                    </TableCell>

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

                    <TableCell>
                      {cat.parent ? (
                        <div className="flex items-center gap-1 text-xs">
                          <FolderTree className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{cat.parent.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Root</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center text-xs font-mono font-medium">
                      {cat.displayOrder ?? 0}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        <Package className="w-3 h-3" />
                        {cat._count?.items ?? 0}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={cat.isActive ? "success" : "default"}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canCreate && (
                          <button
                            onClick={() => handleCreateOpen(cat.id)}
                            title="Add Subcategory"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <FolderPlus className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(cat)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() => handleEditOpen(cat)}
                            title="Edit Category"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteOpen(cat)}
                            title="Delete Category"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{categories.length}</span> of{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">{totalCount}</span> categories
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
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-2 text-xs font-medium">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tree View */
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Category Hierarchy Tree
            </h3>
            <span className="text-xs text-slate-400">
              Nested view supporting unlimited parent-child relations
            </span>
          </div>

          <CategoryTreeView
            categories={treeCategories}
            onView={(node) => handleViewDetails(node as any)}
            onEdit={(node) => handleEditOpen(node as any)}
            onDelete={(node) => handleDeleteOpen(node as any)}
            onAddSubcategory={(node) => handleCreateOpen(node.id)}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        category={editingCategory}
        categories={allCategoriesList}
        defaultParentId={defaultParentId}
      />

      {/* Details View Modal */}
      <CategoryDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        category={selectedCategoryDetails}
        onEdit={(cat) => handleEditOpen(cat)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingCategory(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete Category "${deletingCategory?.name}"`}
        description={`Are you sure you want to delete category "${deletingCategory?.name}" (${deletingCategory?.code})? This is a soft delete operation.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
