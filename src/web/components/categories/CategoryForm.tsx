import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category } from "../../../packages/types/domain";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../../packages/validation/category.validation";
import { Input } from "../../../packages/ui/Input";
import { Textarea } from "../../../packages/ui/Textarea";
import { Select } from "../../../packages/ui/Select";
import { Toggle } from "../../../packages/ui/Toggle";
import { Button } from "../../../packages/ui/Button";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from "../../hooks/category.hooks";
import { AlertCircle } from "lucide-react";

const formSchema = z.object({
  code: z
    .string()
    .trim()
    .refine((val) => val === "" || (val.length >= 2 && val.length <= 20), {
      message: "Category code must be between 2 and 20 characters",
    })
    .refine((val) => val === "" || /^[a-zA-Z0-9-]+$/.test(val), {
      message: "Category code must contain only letters, numbers, and hyphens",
    })
    .optional(),
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  parentCategoryId: z.string().optional(),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be at least 0"),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof formSchema>;

export interface CategoryFormProps {
  category?: Category | null;
  onSuccess: (message: string) => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const isEditing = !!category;
  const [serverError, setServerError] = useState<string | null>(null);

  // Load parent categories for selection
  const { data: parentCategoriesData } = useCategories({ limit: 1000 });
  const allCategories = parentCategoriesData?.items || [];

  // Exclude current category and its descendants when editing
  const getEligibleParents = (): Category[] => {
    if (!category) return allCategories;

    const descendantIds = new Set<string>([category.id]);
    const addChildren = (pId: string) => {
      allCategories.forEach((cat) => {
        if (cat.parentCategoryId === pId && !descendantIds.has(cat.id)) {
          descendantIds.add(cat.id);
          addChildren(cat.id);
        }
      });
    };
    addChildren(category.id);

    return allCategories.filter((cat) => !descendantIds.has(cat.id));
  };

  const eligibleParents = getEligibleParents();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: category?.code || "",
      name: category?.name || "",
      description: category?.description || "",
      parentCategoryId: category?.parentCategoryId || "",
      displayOrder: category?.displayOrder ?? 0,
      isActive: category?.isActive ?? true,
    },
  });

  // Reset form values when initial category changes
  useEffect(() => {
    reset({
      code: category?.code || "",
      name: category?.name || "",
      description: category?.description || "",
      parentCategoryId: category?.parentCategoryId || "",
      displayOrder: category?.displayOrder ?? 0,
      isActive: category?.isActive ?? true,
    });
    setServerError(null);
  }, [category, reset]);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  const onSubmit = async (values: CategoryFormValues) => {
    setServerError(null);

    const parentCatIdVal = values.parentCategoryId?.trim() || null;
    const generatedCode = `CAT-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      if (isEditing && category) {
        const updatePayload: UpdateCategoryInput = {
          name: values.name.trim(),
          code: values.code?.trim() ? values.code.trim().toUpperCase() : undefined,
          description: values.description?.trim() || null,
          parentCategoryId: parentCatIdVal,
          parentId: parentCatIdVal,
          displayOrder: values.displayOrder,
          isActive: values.isActive,
        };
        await updateMutation.mutateAsync({ id: category.id, data: updatePayload });
        onSuccess(`Category "${values.name}" updated successfully`);
      } else {
        const createPayload: CreateCategoryInput = {
          name: values.name.trim(),
          code: values.code?.trim() ? values.code.trim().toUpperCase() : generatedCode,
          description: values.description?.trim() || null,
          parentCategoryId: parentCatIdVal,
          parentId: parentCatIdVal,
          displayOrder: values.displayOrder,
          isActive: values.isActive,
        };
        await createMutation.mutateAsync(createPayload);
        onSuccess(`Category "${values.name}" created successfully`);
      }
    } catch (err: any) {
      const msg = err?.message || err?.error || "Failed to save category";
      setServerError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
      {/* Server Error Banner */}
      {serverError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Category Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Category Name <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("name")}
          placeholder="e.g. Photo Printing, Studio Equipment"
          error={errors.name?.message}
          disabled={isPending}
        />
      </div>

      {/* Category Code */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Category Code
        </label>
        <Input
          {...register("code")}
          placeholder="e.g. CAT-001 (auto-generated if left empty)"
          error={errors.code?.message}
          disabled={isPending}
        />
        <p className="text-xs text-slate-500 mt-1">
          Unique identifier code. Leave blank to auto-generate.
        </p>
      </div>

      {/* Parent Category Selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Parent Category
        </label>
        <Select
          {...register("parentCategoryId")}
          error={errors.parentCategoryId?.message}
          disabled={isPending}
        >
          <option value="">None (Top-Level Category)</option>
          {eligibleParents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name} ({parent.code})
            </option>
          ))}
        </Select>
        <p className="text-xs text-slate-500 mt-1">
          Select a parent category to organize into sub-categories.
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description
        </label>
        <Textarea
          {...register("description")}
          placeholder="Brief description of products or services in this category..."
          rows={3}
          error={errors.description?.message}
          disabled={isPending}
        />
      </div>

      {/* Display Order & Active Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Display Order
          </label>
          <Input
            type="number"
            min="0"
            {...register("displayOrder", { valueAsNumber: true })}
            placeholder="0"
            error={errors.displayOrder?.message}
            disabled={isPending}
          />
        </div>

        <div className="pt-2">
          <Toggle
            id="isActiveToggle"
            label="Active Status"
            description="Active categories are visible across catalog"
            {...register("isActive")}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending}
        >
          {isEditing ? "Save Changes" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
