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
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertCircle,
  ArrowUpDown,
  Ruler,
} from "lucide-react";

import { UnitOfMeasure } from "../../packages/types/domain";
import { UomFormModal } from "../components/uom/UomFormModal";
import { UomDetailsModal } from "../components/uom/UomDetailsModal";

export function Units() {
  const { hasPermission } = usePermission();
  const canView = hasPermission("unit.view");
  const canCreate = hasPermission("unit.create");
  const canUpdate = hasPermission("unit.update");
  const canDelete = hasPermission("unit.delete");

  // List data & pagination
  const [units, setUnits] = useState<(UnitOfMeasure & { itemsCount?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("displayOrder");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUom, setEditingUom] = useState<UnitOfMeasure | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUomDetails, setSelectedUomDetails] = useState<(UnitOfMeasure & { itemsCount?: number }) | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUom, setDeletingUom] = useState<(UnitOfMeasure & { itemsCount?: number }) | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Show toast notification helper
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch paginated UOM list
  const fetchUnits = useCallback(async () => {
    if (!canView) return;
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search.trim()) {
        queryParams.append("search", search.trim());
      }

      if (statusFilter !== "all") {
        queryParams.append("isActive", statusFilter);
      }

      const res = await fetch(`/api/v1/units?${queryParams.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch Units of Measure");
      }

      setUnits(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [canView, page, limit, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  // Handlers
  const handleCreateNew = () => {
    setEditingUom(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (uom: UnitOfMeasure) => {
    setEditingUom(uom);
    setIsFormModalOpen(true);
  };

  const handleViewDetails = async (uomId: string) => {
    try {
      const res = await fetch(`/api/v1/units/${uomId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch details");
      }
      const data = await res.json();
      setSelectedUomDetails(data.data);
      setIsDetailsModalOpen(true);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteClick = (uom: UnitOfMeasure & { itemsCount?: number }) => {
    setDeletingUom(uom);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUom) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/v1/units/${deletingUom.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete Unit of Measure");
      }

      showToast(`Unit of Measure '${deletingUom.name}' was deleted successfully`);
      setIsDeleteModalOpen(false);
      setDeletingUom(null);
      fetchUnits();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canView) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Access Denied</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You do not have permission to view Units of Measure. (`unit.view` required)
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toastMessage.type === "success"
              ? "bg-emerald-600 text-white dark:bg-emerald-500"
              : "bg-rose-600 text-white dark:bg-rose-500"
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Header & Breadcrumbs */}
      <div>
        <Breadcrumbs
          items={[
            { label: "Catalog", href: "/categories" },
            { label: "Units of Measure" },
          ]}
        />
        <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Ruler className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Units of Measure
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Define standard measurement units used across catalog items, inventory, purchasing, and sales.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchUnits} isLoading={isLoading}>
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Refresh
            </Button>
            {canCreate && (
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Create Unit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, code, abbreviation..."
            className="pl-9"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </Select>
          </div>

          {/* Sort Field */}
          <div className="w-40">
            <Select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="displayOrder">Sort: Display Order</option>
              <option value="name">Sort: Name</option>
              <option value="code">Sort: Code</option>
              <option value="abbreviation">Sort: Abbreviation</option>
              <option value="createdAt">Sort: Date Created</option>
            </Select>
          </div>

          {/* Sort Order Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            title={`Sort Order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
            className="px-2.5"
          >
            <ArrowUpDown className="w-4 h-4 mr-1" />
            <span className="text-xs uppercase font-mono">{sortOrder}</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={fetchUnits}>
            Retry
          </Button>
        </div>
      )}

      {/* DataTable */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Unit Name</TableHead>
              <TableHead>Abbreviation</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Order</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Catalog Items</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                  Loading Units of Measure...
                </TableCell>
              </TableRow>
            ) : units.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                  <Ruler className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                    No Units of Measure found
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {search || statusFilter !== "all"
                      ? "Try adjusting your search query or filters"
                      : "Create your first unit of measure to get started"}
                  </p>
                  {canCreate && !search && statusFilter === "all" && (
                    <Button onClick={handleCreateNew} size="sm" className="mt-4">
                      <Plus className="w-4 h-4 mr-1.5" />
                      Create Unit of Measure
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              units.map((uom) => (
                <TableRow key={uom.id}>
                  {/* Code */}
                  <TableCell>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      {uom.code}
                    </span>
                  </TableCell>

                  {/* Name */}
                  <TableCell>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {uom.name}
                    </span>
                  </TableCell>

                  {/* Abbreviation */}
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {uom.abbreviation}
                    </span>
                  </TableCell>

                  {/* Description */}
                  <TableCell className="max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                    {uom.description || "-"}
                  </TableCell>

                  {/* Display Order */}
                  <TableCell className="text-center font-mono text-xs text-slate-600 dark:text-slate-400">
                    {uom.displayOrder}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center">
                    <Badge variant={uom.isActive ? "success" : "default"}>
                      {uom.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  {/* Catalog Items Count */}
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      {uom.itemsCount ?? 0}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(uom.id)}
                        title="View Details"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </Button>

                      {canUpdate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(uom)}
                          title="Edit Unit"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                      )}

                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(uom)}
                          title="Delete Unit"
                          className="h-8 w-8 p-0 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{units.length === 0 ? 0 : (page - 1) * limit + 1}</span> to{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.min(page * limit, totalCount)}</span> of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{totalCount}</span> units
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Per page:</span>
              <div className="w-20">
                <Select
                  value={limit.toString()}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="py-1 text-xs"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                className="h-8 px-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="px-2 font-medium">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                className="h-8 px-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal (Create / Edit) */}
      <UomFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => {
          showToast(`Unit of Measure ${editingUom ? "updated" : "created"} successfully`);
          fetchUnits();
        }}
        uom={editingUom}
      />

      {/* Details Modal */}
      <UomDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        uom={selectedUomDetails}
        onEdit={
          canUpdate && selectedUomDetails
            ? () => handleEdit(selectedUomDetails)
            : undefined
        }
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingUom(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Unit of Measure"
        description={
          deletingUom?.itemsCount && deletingUom.itemsCount > 0
            ? `Cannot delete '${deletingUom?.name}' because it is currently referenced by ${deletingUom.itemsCount} catalog item(s). Reassign or remove those references before deleting.`
            : `Are you sure you want to soft delete unit of measure '${deletingUom?.name}' (${deletingUom?.abbreviation})? This action will deactivate the unit.`
        }
        confirmText={
          deletingUom?.itemsCount && deletingUom.itemsCount > 0
            ? "Cannot Delete"
            : "Yes, Delete Unit"
        }
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
