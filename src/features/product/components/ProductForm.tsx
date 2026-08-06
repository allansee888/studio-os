import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "../../../packages/types/domain";
import {
  CreateProductInput,
  UpdateProductInput,
  CreateProductSchema,
} from "../../../packages/validation/product";
import { Input } from "../../../packages/ui/Input";
import { Textarea } from "../../../packages/ui/Textarea";
import { Toggle } from "../../../packages/ui/Toggle";
import { Button } from "../../../packages/ui/Button";
import { Select } from "../../../packages/ui/Select";
import { toast } from "../../../packages/ui/ToastProvider";
import { useCreateProduct, useUpdateProduct } from "../hooks";
import { useCategories } from "../../../web/hooks/category.hooks";
import { useBrands } from "../../brand/hooks";
import { useUnits } from "../../unit";
import { AlertCircle } from "lucide-react";

import { z } from "zod";

export type ProductFormValues = z.infer<typeof CreateProductSchema>;

export interface ProductFormProps {
  product?: Product | null;
  onSuccess?: (message: string) => void;
  onCancel?: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEditing = !!product;
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const { data: categoryData } = useCategories({ limit: 1000, isActive: true });
  const { data: brandData } = useBrands({ limit: 1000, isActive: true });
  const { data: unitData } = useUnits({ limit: 1000, isActive: true });

  const categories = categoryData?.items || [];
  const brands = brandData?.items || [];
  const units = unitData?.items || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(CreateProductSchema) as any,
    defaultValues: {
      sku: product?.sku || "",
      barcode: product?.barcode || "",
      name: product?.name || "",
      description: product?.description || "",
      categoryId: product?.categoryId || "",
      brandId: product?.brandId || "",
      unitId: product?.unitId || "",
      costPrice: product?.costPrice !== undefined ? Number(product.costPrice) : 0,
      sellingPrice: product?.sellingPrice !== undefined ? Number(product.sellingPrice) : 0,
      minimumStock: product?.minimumStock || 0,
      maximumStock: product?.maximumStock || 0,
      reorderPoint: product?.reorderPoint || 0,
      trackInventory: product?.trackInventory ?? true,
      allowNegativeInventory: product?.allowNegativeInventory ?? false,
      isActive: product?.isActive ?? true,
    },
  });

  useEffect(() => {
    reset({
      sku: product?.sku || "",
      barcode: product?.barcode || "",
      name: product?.name || "",
      description: product?.description || "",
      categoryId: product?.categoryId || "",
      brandId: product?.brandId || "",
      unitId: product?.unitId || "",
      costPrice: product?.costPrice !== undefined ? Number(product.costPrice) : 0,
      sellingPrice: product?.sellingPrice !== undefined ? Number(product.sellingPrice) : 0,
      minimumStock: product?.minimumStock || 0,
      maximumStock: product?.maximumStock || 0,
      reorderPoint: product?.reorderPoint || 0,
      trackInventory: product?.trackInventory ?? true,
      allowNegativeInventory: product?.allowNegativeInventory ?? false,
      isActive: product?.isActive ?? true,
    });
    setServerError(null);
  }, [product, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  const onSubmit = async (values: ProductFormValues) => {
    setServerError(null);

    try {
      if (isEditing && product) {
        const updatePayload: UpdateProductInput = {
          ...values,
          sku: values.sku.trim().toUpperCase(),
          barcode: values.barcode?.trim() || null,
          name: values.name.trim(),
          description: values.description?.trim() || null,
        };
        await updateMutation.mutateAsync({ id: product.id, data: updatePayload });
        
        const successMessage = `Product "${values.name}" updated successfully`;
        toast({
          title: "Product Updated",
          description: successMessage,
          type: "success",
        });
        onSuccess?.(successMessage);
      } else {
        const createPayload: CreateProductInput = {
          ...values,
          sku: values.sku.trim().toUpperCase(),
          barcode: values.barcode?.trim() || null,
          name: values.name.trim(),
          description: values.description?.trim() || null,
        };
        await createMutation.mutateAsync(createPayload);
        
        const successMessage = `Product "${values.name}" created successfully`;
        toast({
          title: "Product Created",
          description: successMessage,
          type: "success",
        });
        onSuccess?.(successMessage);
      }
    } catch (err: any) {
      const errorMsg = err?.message || err?.error || "Failed to save product";
      setServerError(errorMsg);
      toast({
        title: "Error Saving Product",
        description: errorMsg,
        type: "error",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1 max-h-[70vh] overflow-y-auto px-1">
      {/* Server Error Banner */}
      {serverError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* General Section */}
      <h3 className="text-lg font-semibold border-b pb-2">General Info</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            SKU <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("sku")}
            placeholder="e.g. PRD-001"
            error={errors.sku?.message}
            disabled={isPending}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Barcode
          </label>
          <Input
            {...register("barcode")}
            placeholder="e.g. 012345678905"
            error={errors.barcode?.message}
            disabled={isPending}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Product Name <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("name")}
          placeholder="e.g. Premium Widget"
          error={errors.name?.message}
          disabled={isPending}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description
        </label>
        <Textarea
          {...register("description")}
          placeholder="Brief description of this product..."
          rows={3}
          error={errors.description?.message}
          disabled={isPending}
        />
      </div>

      {/* Relationships Section */}
      <h3 className="text-lg font-semibold border-b pb-2 pt-2">Categorization</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <Select
            {...register("categoryId")}
            error={errors.categoryId?.message}
            disabled={isPending}
            options={[
              { label: "Select Category", value: "" },
              ...categories.map(c => ({ label: c.name, value: c.id }))
            ]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Brand <span className="text-red-500">*</span>
          </label>
          <Select
            {...register("brandId")}
            error={errors.brandId?.message}
            disabled={isPending}
            options={[
              { label: "Select Brand", value: "" },
              ...brands.map(b => ({ label: b.name, value: b.id }))
            ]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Unit <span className="text-red-500">*</span>
          </label>
          <Select
            {...register("unitId")}
            error={errors.unitId?.message}
            disabled={isPending}
            options={[
              { label: "Select Unit", value: "" },
              ...units.map(u => ({ label: u.name, value: u.id }))
            ]}
          />
        </div>
      </div>

      {/* Pricing Section */}
      <h3 className="text-lg font-semibold border-b pb-2 pt-2">Pricing</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Cost Price <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("costPrice")}
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.costPrice?.message}
            disabled={isPending}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Selling Price <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("sellingPrice")}
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.sellingPrice?.message}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Inventory Section */}
      <h3 className="text-lg font-semibold border-b pb-2 pt-2">Inventory Management</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="pt-2">
          <Toggle
            id="trackInventoryToggle"
            label="Track Inventory"
            {...register("trackInventory")}
            disabled={isPending}
          />
        </div>
        <div className="pt-2">
          <Toggle
            id="allowNegativeToggle"
            label="Allow Negative Inventory"
            {...register("allowNegativeInventory")}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Minimum Stock
          </label>
          <Input
            {...register("minimumStock")}
            type="number"
            error={errors.minimumStock?.message}
            disabled={isPending}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Maximum Stock
          </label>
          <Input
            {...register("maximumStock")}
            type="number"
            error={errors.maximumStock?.message}
            disabled={isPending}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Reorder Point
          </label>
          <Input
            {...register("reorderPoint")}
            type="number"
            error={errors.reorderPoint?.message}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Active Status Row */}
      <div className="pt-4 border-t mt-4">
        <Toggle
          id="productIsActiveToggle"
          label="Active Status"
          description="Active products are selectable in orders"
          {...register("isActive")}
          disabled={isPending}
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending}
        >
          {isEditing ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}

export default ProductForm;
