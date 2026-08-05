import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UnitOfMeasure } from "../../../packages/types/domain";
import { CreateUnitInput, UpdateUnitInput } from "../../../packages/validation/uom";
import { Input } from "../../../packages/ui/Input";
import { Textarea } from "../../../packages/ui/Textarea";
import { Toggle } from "../../../packages/ui/Toggle";
import { Button } from "../../../packages/ui/Button";
import { toast } from "../../../packages/ui/ToastProvider";
import { useCreateUnit, useUpdateUnit } from "../index";
import { AlertCircle } from "lucide-react";

const unitFormSchema = z.object({
  code: z
    .string()
    .trim()
    .max(20, "Code cannot exceed 20 characters")
    .optional()
    .or(z.literal("")),
  name: z
    .string()
    .trim()
    .min(1, "Unit name is required")
    .max(100, "Unit name cannot exceed 100 characters"),
  abbreviation: z
    .string()
    .trim()
    .min(1, "Abbreviation is required")
    .max(10, "Abbreviation cannot exceed 10 characters"),
  decimalPlaces: z
    .number()
    .int("Decimal places must be an integer")
    .min(0, "Decimal places must be between 0 and 6")
    .max(6, "Decimal places must be between 0 and 6"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be at least 0"),

  isActive: z.boolean(),
});


export type UnitFormValues = z.infer<typeof unitFormSchema>;

export interface UnitFormProps {
  unit?: UnitOfMeasure | null;
  onSuccess?: (message: string) => void;
  onCancel?: () => void;
}

export function UnitForm({ unit, onSuccess, onCancel }: UnitFormProps) {
  const isEditing = !!unit;
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useCreateUnit();
  const updateMutation = useUpdateUnit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      code: unit?.code || "",
      name: unit?.name || "",
      abbreviation: unit?.abbreviation || "",
      decimalPlaces: unit?.decimalPlaces ?? 2,
      description: unit?.description || "",
      displayOrder: unit?.displayOrder ?? 0,
      isActive: unit?.isActive ?? true,
    },
  });

  useEffect(() => {
    reset({
      code: unit?.code || "",
      name: unit?.name || "",
      abbreviation: unit?.abbreviation || "",
      decimalPlaces: unit?.decimalPlaces ?? 2,
      description: unit?.description || "",
      displayOrder: unit?.displayOrder ?? 0,
      isActive: unit?.isActive ?? true,
    });
    setServerError(null);
  }, [unit, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  const onSubmit = async (values: UnitFormValues) => {
    setServerError(null);

    const formattedCode = values.code?.trim() ? values.code.trim().toUpperCase() : undefined;
    const formattedDesc = values.description?.trim() || null;

    try {
      if (isEditing && unit) {
        const updatePayload: UpdateUnitInput = {
          code: formattedCode,
          name: values.name.trim(),
          abbreviation: values.abbreviation.trim(),
          decimalPlaces: values.decimalPlaces,
          description: formattedDesc,
          displayOrder: values.displayOrder,
          isActive: values.isActive,
        };
        await updateMutation.mutateAsync({ id: unit.id, data: updatePayload });
        const successMessage = `Unit "${values.name}" updated successfully`;
        toast({
          title: "Unit Updated",
          description: successMessage,
          type: "success",
        });
        onSuccess?.(successMessage);
      } else {
        const createPayload: CreateUnitInput = {
          code: formattedCode,
          name: values.name.trim(),
          abbreviation: values.abbreviation.trim(),
          decimalPlaces: values.decimalPlaces,
          description: formattedDesc,
          displayOrder: values.displayOrder,
          isActive: values.isActive,
        };
        await createMutation.mutateAsync(createPayload);
        const successMessage = `Unit "${values.name}" created successfully`;
        toast({
          title: "Unit Created",
          description: successMessage,
          type: "success",
        });
        onSuccess?.(successMessage);
      }
    } catch (err: any) {
      const errorMsg = err?.message || err?.error || "Failed to save unit of measure";
      setServerError(errorMsg);
      toast({
        title: "Error Saving Unit",
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

      {/* Name and Abbreviation Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Unit Name <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("name")}
            placeholder="e.g. Piece, Kilogram, Hour"
            error={errors.name?.message}
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Abbreviation <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("abbreviation")}
            placeholder="e.g. pcs, kg, hr"
            error={errors.abbreviation?.message}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Code and Decimal Places Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Unit Code
          </label>
          <Input
            {...register("code")}
            placeholder="e.g. UOM-PCS (optional)"
            error={errors.code?.message}
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Decimal Places
          </label>
          <Input
            type="number"
            min="0"
            max="6"
            {...register("decimalPlaces", { valueAsNumber: true })}
            placeholder="2"
            error={errors.decimalPlaces?.message}
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
          placeholder="Brief description of this unit of measure..."
          rows={3}
          error={errors.description?.message}
          disabled={isPending}
        />
      </div>

      {/* Display Order & Active Status Row */}
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
            id="unitIsActiveToggle"
            label="Active Status"
            description="Active units are selectable in catalog"
            {...register("isActive")}
            disabled={isPending}
          />
        </div>
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
          {isEditing ? "Save Changes" : "Create Unit"}
        </Button>
      </div>
    </form>
  );
}

export default UnitForm;
