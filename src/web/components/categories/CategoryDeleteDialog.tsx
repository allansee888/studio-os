import React, { useState, useEffect } from "react";
import { Modal } from "../../../packages/ui/Modal";
import { Button } from "../../../packages/ui/Button";
import { Category } from "../../../packages/types/domain";
import { useDeleteCategory } from "../../hooks/category.hooks";
import { AlertTriangle, AlertCircle } from "lucide-react";

export interface CategoryDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSuccess?: (message: string) => void;
}

export function CategoryDeleteDialog({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryDeleteDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteMutation = useDeleteCategory();

  // Reset error when target category or dialog open state changes
  useEffect(() => {
    setErrorMessage(null);
  }, [category, isOpen]);

  if (!category) return null;

  const handleDelete = async () => {
    setErrorMessage(null);
    try {
      await deleteMutation.mutateAsync(category.id);
      if (onSuccess) {
        onSuccess(`Category "${category.name}" (${category.code}) deleted successfully`);
      }
      onClose();
    } catch (err: any) {
      const msg = err?.message || err?.error || "Failed to delete category due to a business rule constraint";
      setErrorMessage(msg);
    }
  };

  const isPending = deleteMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isPending) onClose();
      }}
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-full shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Delete Category
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Are you sure you want to delete this category?
            </p>
          </div>
        </div>

        {/* Business Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm flex items-start gap-2 animate-in fade-in-50">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Category Details Card */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Category Name:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{category.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Category Code:</span>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{category.code}</span>
          </div>
        </div>

        {/* Warning Statement */}
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          Warning: This action cannot be undone.
        </p>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isPending}
            disabled={isPending}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CategoryDeleteDialog;
