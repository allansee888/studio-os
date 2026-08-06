import React, { useState } from "react";
import { Plus, Edit, Trash2, Eye, Package, Tag, Filter } from "lucide-react";
import { Product } from "../../../packages/types/domain";
import { useProducts } from "../hooks";
import { useCategories } from "../../../web/hooks/category.hooks";
import { useBrands } from "../../brand/hooks";
import { CrudPage } from "../../../components/crud/CrudPage";
import { CrudTable, CrudTableColumn } from "../../../components/crud/CrudTable";
import { CrudPagination } from "../../../components/crud/CrudPagination";
import { CrudToolbar } from "../../../components/crud/CrudToolbar";
import { CrudStatusBadge } from "../../../components/crud/CrudStatusBadge";
import { CrudErrorState } from "../../../components/crud/CrudErrorState";
import { Button } from "../../../packages/ui/Button";
import { Select } from "../../../packages/ui/Select";
import { ProductDialog } from "../components/ProductDialog";
import { ProductDeleteDialog } from "../components/ProductDeleteDialog";

export function ProductListPage() {
  // Permissions placeholder
  const canView = true;
  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;

  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"sku" | "name" | "sellingPrice" | "createdAt" | "updatedAt">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // References
  const { data: categoryData } = useCategories({ limit: 100, isActive: true });
  const { data: brandData } = useBrands({ limit: 100, isActive: true });

  const categories = categoryData?.items || [];
  const brands = brandData?.items || [];

  // Construct Query Parameters
  const queryParams = {
    page,
    limit,
    search: search.trim() || undefined,
    isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
    categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
    brandId: brandFilter !== "all" ? brandFilter : undefined,
    sortBy,
    sortOrder,
  };

  // Fetch Products via Shared CRUD Hook
  const { data, isLoading, isError, error, refetch, isFetching } = useProducts(queryParams, {
    enabled: canView,
  });

  const products = data?.items || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Handlers
  const handleNewProduct = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleView = (product: Product) => {
    // Action Placeholder
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };

  const handleDialogSuccess = () => {
    refetch();
  };

  const toggleSort = (field: "sku" | "name" | "sellingPrice" | "createdAt" | "updatedAt") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Define Table Columns
  const columns: CrudTableColumn<Product>[] = [
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      sortField: "sku",
      width: "w-32",
      className: "font-mono text-xs font-semibold text-slate-700 dark:text-slate-300",
      render: (product) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
          {product.sku || "—"}
        </span>
      ),
    },
    {
      key: "name",
      header: "Product",
      sortable: true,
      sortField: "name",
      render: (product) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {product.name}
          </span>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
             {product.category?.name && <span>{product.category.name}</span>}
             {product.category?.name && product.brand?.name && <span>•</span>}
             {product.brand?.name && <span>{product.brand.name}</span>}
          </div>
        </div>
      ),
    },
    {
      key: "sellingPrice",
      header: "Price",
      sortable: true,
      sortField: "sellingPrice",
      width: "w-28",
      render: (product) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {formatCurrency(Number(product.sellingPrice))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "w-28",
      render: (product) => <CrudStatusBadge isActive={product.isActive} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "w-32",
      render: (product) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleView(product)}
            title="View Product"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canUpdate && (
            <button
              onClick={() => handleEdit(product)}
              title="Edit Product"
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(product)}
              title="Delete Product"
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
      title="Products"
      description="Manage your physical product catalog, pricing, and inventory settings."
      breadcrumbs={[{ label: "Catalog", href: "/catalog" }, { label: "Products" }]}
      primaryAction={
        canCreate ? (
          <Button onClick={handleNewProduct} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Product
          </Button>
        ) : undefined
      }
      accessDenied={!canView}
      accessDeniedMessage="You do not have permission (`product.view`) to view products."
      toolbar={
        <div className="flex flex-col sm:flex-row gap-3 w-full items-start sm:items-center justify-between">
          <CrudToolbar
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            searchPlaceholder="Search by SKU, Barcode, or Name..."
            filters={
              <div className="flex gap-2">
                <Select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-40"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
                <Select
                  value={brandFilter}
                  onChange={(e) => {
                    setBrandFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-36"
                >
                  <option value="all">All Brands</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Select>
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
              </div>
            }
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
            refreshTitle="Refresh Products List"
          />
        </div>
      }
      table={
        <div className="space-y-4">
          {isError && (
            <CrudErrorState
              error={error}
              message={error?.message || "Failed to load products"}
              onRetry={() => refetch()}
            />
          )}

          <CrudTable
            columns={columns}
            data={products}
            keyExtractor={(product) => product.id}
            isLoading={isLoading}
            isError={isError}
            emptyTitle="No products found"
            emptyDescription="No products match the selected search criteria or filters."
            emptyIcon={<Package className="w-8 h-8 text-slate-400" />}
            emptyAction={
              canCreate ? (
                <Button size="sm" onClick={handleNewProduct} className="mt-2">
                  <Plus className="w-4 h-4 mr-1" /> Add Product
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
                itemLabel="products"
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
          <ProductDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            product={selectedProduct}
            onSuccess={handleDialogSuccess}
          />

          <ProductDeleteDialog
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            product={productToDelete}
            onSuccess={handleDialogSuccess}
          />
        </>
      }
    />
  );
}

export default ProductListPage;
