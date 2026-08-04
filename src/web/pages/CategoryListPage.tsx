import React, { useState } from "react";
import { useCategories } from "../hooks/category.hooks";
import { usePermission } from "../hooks/usePermission";
import { Category } from "../../packages/types/domain";
import { Button } from "../../packages/ui/Button";
import { Select } from "../../packages/ui/Select";
import { CategoryDialog } from "../components/categories/CategoryDialog";
import { CategoryDeleteDialog } from "../components/categories/CategoryDeleteDialog";
import {
  CrudPage,
  CrudToolbar,
  CrudTable,
  CrudTableColumn,
  CrudPagination,
  CrudStatusBadge,
  CrudErrorState,
} from "../../components/crud";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Eye,
  FolderOpen,
} from "lucide-react";

export function CategoryListPage() {
  const { hasAnyPermission } = usePermission();
  const canView = hasAnyPermission(["category.view", "catalog.category.view"]);
  const canDelete = hasAnyPermission(["category.delete", "catalog.category.delete"]);

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

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

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
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
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

  // Define Table Columns
  const columns: CrudTableColumn<Category>[] = [
    {
      key: "code",
      header: "Category Code",
      sortable: true,
      sortField: "code",
      width: "w-32",
      className: "font-mono text-xs font-semibold text-slate-700 dark:text-slate-300",
      render: (cat) => cat.code,
    },
    {
      key: "name",
      header: "Category Name",
      sortable: true,
      sortField: "name",
      render: (cat) => (
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
      ),
    },
    {
      key: "parent",
      header: "Parent Category",
      render: (cat) =>
        cat.parent ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <FolderTree className="w-3.5 h-3.5 text-slate-400" />
            <span>{cat.parent.name}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Root</span>
        ),
    },
    {
      key: "displayOrder",
      header: "Display Order",
      sortable: true,
      sortField: "displayOrder",
      align: "center",
      width: "w-32",
      className: "font-mono text-xs font-medium",
      render: (cat) => cat.displayOrder ?? 0,
    },
    {
      key: "status",
      header: "Status",
      width: "w-28",
      render: (cat) => <CrudStatusBadge isActive={cat.isActive} />,
    },
    {
      key: "createdAt",
      header: "Created Date",
      sortable: true,
      sortField: "createdAt",
      width: "w-36",
      className: "text-xs text-slate-500 dark:text-slate-400",
      render: (cat) => formatDate(cat.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "w-32",
      render: (cat) => (
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
          {canDelete && (
            <button
              onClick={() => handleDelete(cat)}
              title="Delete Category"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <CrudPage
      title="Categories"
      description="Manage product and service categories, display order, and hierarchy."
      breadcrumbs={[{ label: "Catalog", href: "/categories" }, { label: "Categories" }]}
      primaryAction={
        <Button onClick={handleNewCategory} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Category
        </Button>
      }
      feedbackMessage={actionFeedback}
      accessDenied={!canView}
      accessDeniedMessage="You do not have permission (`category.view`) to view product categories."
      toolbar={
        <CrudToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          searchPlaceholder="Search by code or name..."
          filters={
            <>
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
            </>
          }
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
          refreshTitle="Refresh Category List"
        />
      }
      table={
        <div className="space-y-4">
          {isError && (
            <CrudErrorState
              error={error}
              message={error?.message || "Failed to load categories"}
              onRetry={() => refetch()}
            />
          )}
          <CrudTable
            columns={columns}
            data={categories}
            keyExtractor={(cat) => cat.id}
            isLoading={isLoading}
            isError={isError}
            emptyTitle="No categories found"
            emptyDescription="No categories match the selected search criteria or filters."
            emptyIcon={<FolderOpen className="w-8 h-8 text-slate-400" />}
            emptyAction={
              <Button size="sm" onClick={handleNewCategory} className="mt-2">
                <Plus className="w-4 h-4 mr-1" /> Add Category
              </Button>
            }
            onSort={(field) => toggleSort(field as any)}
            footer={
              <CrudPagination
                page={page}
                limit={limit}
                total={pagination.total}
                totalPages={pagination.totalPages || 1}
                itemLabel="categories"
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                isLoading={isLoading}
              />
            }
          />
        </div>
      }
      dialogs={
        <>
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

          {/* Category Delete Confirmation Dialog */}
          <CategoryDeleteDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setCategoryToDelete(null);
            }}
            category={categoryToDelete}
            onSuccess={(msg) => {
              triggerPlaceholderFeedback(msg);
              refetch();
            }}
          />
        </>
      }
    />
  );
}

export default CategoryListPage;
