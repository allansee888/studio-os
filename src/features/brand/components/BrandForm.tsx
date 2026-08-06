import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Brand } from "../../../packages/types/domain";
import { CreateBrandInput, UpdateBrandInput } from "../../../packages/validation/brand";
import { Input } from "../../../packages/ui/Input";
import { Textarea } from "../../../packages/ui/Textarea";
import { Toggle } from "../../../packages/ui/Toggle";
import { Button } from "../../../packages/ui/Button";
import { toast } from "../../../packages/ui/ToastProvider";
import { useCreateBrand, useUpdateBrand } from "../hooks";
import { AlertCircle } from "lucide-react";

const brandFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Brand code is required")
    .max(20, "Code cannot exceed 20 characters"),
  name: z
    .string()
    .trim()
    .min(1, "Brand name is required")
    .max(100, "Brand name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .trim()
    .max(255, "Website URL cannot exceed 255 characters")
    .refine(
      (val) => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid website URL format" }
    )
    .optional()
    .or(z.literal("")),
  logoUrl: z
    .string()
    .trim()
    .max(500, "Logo URL cannot exceed 500 characters")
    .refine(
      (val) => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid Logo URL format" }
    )
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;

export interface BrandFormProps {
  brand?: Brand | null;
  onSuccess?: (message: string) => void;
  onCancel?: () => void;
}

export function BrandForm({ brand, onSuccess, onCancel }: BrandFormProps) {
  const isEditing = !!brand;
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      code: brand?.code || "",
      name: brand?.name || "",
      description: brand?.description || "",
      website: brand?.website || "",
      logoUrl: brand?.logoUrl || "",
      isActive: brand?.isActive ?? true,
    },
  });

  useEffect(() => {
    reset({
      code: brand?.code || "",
      name: brand?.name || "",
      description: brand?.description || "",
      website: brand?.website || "",
      logoUrl: brand?.logoUrl || "",
      isActive: brand?.isActive ?? true,
    });
    setServerError(null);
  }, [brand, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  const onSubmit = async (values: BrandFormValues) => {
    setServerError(null);

    const formattedCode = values.code.trim().toUpperCase();
    const formattedDesc = values.description?.trim() || null;
    const formattedWebsite = values.website?.trim() || null;
    const formattedLogoUrl = values.logoUrl?.trim() || null;

    try {
      if (isEditing && brand) {
        const updatePayload: UpdateBrandInput = {
          code: formattedCode,
          name: values.name.trim(),
          description: formattedDesc,
          website: formattedWebsite,
          logoUrl: formattedLogoUrl,
          isActive: values.isActive,
        };

        await updateMutation.mutateAsync({ id: brand.id, data: updatePayload });
        
        const successMessage = `Brand "${values.name}" updated successfully`;
        toast({
          title: "Brand Updated",
          description: successMessage,
          type: "success",
        });
        onSuccess?.(successMessage);
      } else {
        const createPayload: CreateBrandInput = {
          code: formattedCode,
          name: values.name.trim(),
          description: formattedDesc,
          website: formattedWebsite,
          logoUrl: formattedLogoUrl,
          isActive: values.isActive,
        };

        await createMutation.mutateAsync(createPayload);
        
        const successMessage = `Brand "${values.name}" created successfully`;
        toast({
          title: "Brand Created",
          description: successMessage,
          type: "success",
        });
        onSuccess?.(successMessage);
      }
    } catch (err: any) {
      const errorMsg = err?.message || err?.error || "Failed to save brand";
      setServerError(errorMsg);
      toast({
        title: "Error Saving Brand",
        description: errorMsg,
        type: "error",
      });
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

      {/* Code and Name Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Brand Code <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("code")}
            placeholder="e.g. NIKE"
            error={errors.code?.message}
            disabled={isPending}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Brand Name <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("name")}
            placeholder="e.g. Nike, Inc."
            error={errors.name?.message}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Website and Logo URL Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Website
          </label>
          <Input
            {...register("website")}
            placeholder="https://example.com"
            error={errors.website?.message}
            disabled={isPending}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Logo URL
          </label>
          <Input
            {...register("logoUrl")}
            placeholder="https://example.com/logo.png"
            error={errors.logoUrl?.message}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description
        </label>
        <Textarea
          {...register("description")}
          placeholder="Brief description of this brand..."
          rows={3}
          error={errors.description?.message}
          disabled={isPending}
        />
      </div>

      {/* Active Status Row */}
      <div className="pt-2">
        <Toggle
          id="brandIsActiveToggle"
          label="Active Status"
          description="Active brands are selectable in catalog"
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
          {isEditing ? "Save Changes" : "Create Brand"}
        </Button>
      </div>
    </form>
  );
}

export default BrandForm;
