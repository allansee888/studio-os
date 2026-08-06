import React, { useState } from "react";
import { useBrands } from "../hooks";
import { BrandWithCount } from "../api";
import { BrandDialog } from "../components/BrandDialog";
import { BrandDeleteDialog } from "../components/BrandDeleteDialog";
import { usePermission } from "../../../web/hooks/usePermission";
import { Button } from "../../../packages/ui/Button";
import { Select } from "../../../packages/ui/Select";
import {
  CrudPage,
  CrudToolbar,
  CrudTable,
  CrudTableColumn,
  CrudPagination,
  CrudStatusBadge,
  CrudErrorState,
} from "../../../components/crud";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

export function BrandListPage() {
  const { hasAnyPermission } = usePermission();
  const canView = hasAnyPermission(["brand.view", "catalog.brand.view"]);
  const canCreate = hasAnyPermission(["brand.create", "catalog.brand.create"]);
  const canUpdate = hasAnyPermission(["brand.update", "catalog.brand.update"]);
  const canDelete = hasAnyPermission(["brand.delete", "catalog.brand.delete"]);

  // Server-side search, filtering, sorting, and pagination state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "code" | "createdAt">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandWithCount | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<BrandWithCount | null>(null);

  // Construct Query Parameters
  const queryParams = {
    page,
    limit,
    search: search.trim() || undefined,
    isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
    sortBy,
    sortOrder,
  };

  // Fetch Brands via Shared CRUD Hook
  const { data, isLoading, isError, error, refetch, isFetching } = useBrands(queryParams, {
    enabled: canView,
  });

  const brands = data?.items || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Handlers
  const handleNewBrand = () => {
    setSelectedBrand(null);
    setIsDialogOpen(true);
  };

  const handleView = (brand: BrandWithCount) => {
    // Action Placeholder
  };

  const handleEdit = (brand: BrandWithCount) => {
    setSelectedBrand(brand);
    setIsDialogOpen(true);
  };

  const handleDelete = (brand: BrandWithCount) => {
    setBrandToDelete(brand);
    setIsDeleteOpen(true);
  };

  const handleDialogSuccess = () => {
    refetch();
  };

  const toggleSort = (field: "name" | "code" | "createdAt") => {
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
  const columns: CrudTableColumn<BrandWithCount>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      sortField: "code",
      width: "w-32",
      className: "font-mono text-xs font-semibold text-slate-700 dark:text-slate-300",
      render: (brand) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
          {brand.code || "—"}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      sortField: "name",
      render: (brand) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {brand.name}
          </span>
          {brand.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">
              {brand.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "website",
      header: "Website",
      render: (brand) => (
        brand.website ? (
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            {brand.website.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <span className="text-slate-400">—</span>
        )
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "w-28",
      render: (brand) => <CrudStatusBadge isActive={brand.isActive} />,
    },
    {
      key: "createdAt",
      header: "Created Date",
      sortable: true,
      sortField: "createdAt",
      width: "w-36",
      className: "text-xs text-slate-500 dark:text-slate-400",
      render: (brand) => formatDate(brand.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "w-32",
      render: (brand) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleView(brand)}
            title="View Brand"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canUpdate && (
            <button
              onClick={() => handleEdit(brand)}
              title="Edit Brand"
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(brand)}
              title="Delete Brand"
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
      title="Brands"
      description="Manage catalog brands for products."
      breadcrumbs={[{ label: "Catalog", href: "/catalog" }, { label: "Brands" }]}
      primaryAction={
        canCreate ? (
          <Button onClick={handleNewBrand} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Brand
          </Button>
        ) : undefined
      }
      accessDenied={!canView}
      accessDeniedMessage="You do not have permission (`brand.view`) to view brands."
      toolbar={
        <CrudToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          searchPlaceholder="Search by code or name..."
          filters={
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
          }
          onRefresh={() => refetch()}
          isRefreshing={isFetching}
          refreshTitle="Refresh Brands List"
        />
      }
      table={
        <div className="space-y-4">
          {isError && (
            <CrudErrorState
              error={error}
              message={error?.message || "Failed to load brands"}
              onRetry={() => refetch()}
            />
          )}
          <CrudTable
            columns={columns}
            data={brands}
            keyExtractor={(brand) => brand.id}
            isLoading={isLoading}
            isError={isError}
            emptyTitle="No brands found"
            emptyDescription="No brands match the selected search criteria or filters."
            emptyIcon={<Tag className="w-8 h-8 text-slate-400" />}
            emptyAction={
              canCreate ? (
                <Button size="sm" onClick={handleNewBrand} className="mt-2">
                  <Plus className="w-4 h-4 mr-1" /> Add Brand
                </Button>
              ) : undefined
            }
            onSort={(field) => toggleSort(field as any)}
            footer={
              <CrudPagination
                page={page}
                limit={limit}
                total={pagination.total}
                totalPages={pagination.totalPages || 1}
                itemLabel="brands"
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
          <BrandDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            brand={selectedBrand}
            onSuccess={handleDialogSuccess}
          />
          <BrandDeleteDialog
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            brand={brandToDelete}
            onSuccess={handleDialogSuccess}
          />
        </>
      }
    />
  );
}

export default BrandListPage;
