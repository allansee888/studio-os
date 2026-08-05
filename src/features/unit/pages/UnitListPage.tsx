import React, { useState } from "react";
import { useUnits, UnitWithCount } from "../index";
import { UnitDialog } from "../components/UnitDialog";
import { UnitDeleteDialog } from "../components/UnitDeleteDialog";
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
  Ruler,
  Plus,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

export function UnitListPage() {
  const { hasAnyPermission } = usePermission();
  const canView = hasAnyPermission(["unit.view", "catalog.unit.view"]);
  const canCreate = hasAnyPermission(["unit.create", "catalog.unit.create"]);
  const canUpdate = hasAnyPermission(["unit.update", "catalog.unit.update"]);
  const canDelete = hasAnyPermission(["unit.delete", "catalog.unit.delete"]);

  // Server-side search, filtering, sorting, and pagination state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "code" | "abbreviation" | "displayOrder" | "createdAt">("displayOrder");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithCount | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<UnitWithCount | null>(null);

  // Notice/action feedback state for view/delete placeholder handlers
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const triggerPlaceholderFeedback = (message: string) => {
    setActionFeedback(message);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Construct Query Parameters
  const queryParams = {
    page,
    limit,
    search: search.trim() || undefined,
    isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
    sortBy,
    sortOrder,
  };

  // Fetch Units via Shared CRUD Hook
  const { data, isLoading, isError, error, refetch, isFetching } = useUnits(queryParams, {
    enabled: canView,
  });

  const units = data?.items || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Handlers
  const handleNewUnit = () => {
    setSelectedUnit(null);
    setIsDialogOpen(true);
  };

  const handleView = (unit: UnitWithCount) => {
    triggerPlaceholderFeedback(`Action Placeholder: Viewing unit "${unit.name}" (${unit.code || unit.abbreviation})`);
  };

  const handleEdit = (unit: UnitWithCount) => {
    setSelectedUnit(unit);
    setIsDialogOpen(true);
  };

  const handleDelete = (unit: UnitWithCount) => {
    setUnitToDelete(unit);
    setIsDeleteOpen(true);
  };

  const handleDialogSuccess = () => {
    refetch();
  };

  const toggleSort = (field: "name" | "code" | "abbreviation" | "displayOrder" | "createdAt") => {
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
  const columns: CrudTableColumn<UnitWithCount>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      sortField: "code",
      width: "w-32",
      className: "font-mono text-xs font-semibold text-slate-700 dark:text-slate-300",
      render: (unit) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
          {unit.code || "—"}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      sortField: "name",
      render: (unit) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {unit.name}
          </span>
          {unit.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">
              {unit.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "abbreviation",
      header: "Abbreviation",
      sortable: true,
      sortField: "abbreviation",
      width: "w-32",
      render: (unit) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {unit.abbreviation}
        </span>
      ),
    },
    {
      key: "decimalPlaces",
      header: "Decimal Places",
      align: "center",
      width: "w-32",
      className: "font-mono text-xs font-medium",
      render: (unit) => unit.decimalPlaces ?? 2,
    },
    {
      key: "status",
      header: "Status",
      width: "w-28",
      render: (unit) => <CrudStatusBadge isActive={unit.isActive} />,
    },
    {
      key: "createdAt",
      header: "Created Date",
      sortable: true,
      sortField: "createdAt",
      width: "w-36",
      className: "text-xs text-slate-500 dark:text-slate-400",
      render: (unit) => formatDate(unit.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "w-32",
      render: (unit) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleView(unit)}
            title="View Unit"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canUpdate && (
            <button
              onClick={() => handleEdit(unit)}
              title="Edit Unit"
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(unit)}
              title="Delete Unit"
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
      title="Units of Measure"
      description="Manage standard units of measure for products and services."
      breadcrumbs={[{ label: "Catalog", href: "/categories" }, { label: "Units of Measure" }]}
      primaryAction={
        canCreate ? (
          <Button onClick={handleNewUnit} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Unit
          </Button>
        ) : undefined
      }
      feedbackMessage={actionFeedback}
      feedbackIcon={<Ruler className="w-5 h-5 text-blue-400 dark:text-blue-600" />}
      accessDenied={!canView}
      accessDeniedMessage="You do not have permission (`unit.view`) to view units of measure."
      toolbar={
        <CrudToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          searchPlaceholder="Search by code, name, or abbreviation..."
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
          refreshTitle="Refresh Units List"
        />
      }
      table={
        <div className="space-y-4">
          {isError && (
            <CrudErrorState
              error={error}
              message={error?.message || "Failed to load units of measure"}
              onRetry={() => refetch()}
            />
          )}
          <CrudTable
            columns={columns}
            data={units}
            keyExtractor={(unit) => unit.id}
            isLoading={isLoading}
            isError={isError}
            emptyTitle="No units of measure found"
            emptyDescription="No units match the selected search criteria or filters."
            emptyIcon={<Ruler className="w-8 h-8 text-slate-400" />}
            emptyAction={
              canCreate ? (
                <Button size="sm" onClick={handleNewUnit} className="mt-2">
                  <Plus className="w-4 h-4 mr-1" /> Add Unit
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
                itemLabel="units"
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
          <UnitDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            unit={selectedUnit}
            onSuccess={handleDialogSuccess}
          />
          <UnitDeleteDialog
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            unit={unitToDelete}
            onSuccess={handleDialogSuccess}
          />
        </>
      }
    />
  );
}



export default UnitListPage;
