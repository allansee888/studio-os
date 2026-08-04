import React, { useState, useEffect } from "react";
import { Category } from "../../../packages/types/domain";
import { useDeleteCategory } from "../../hooks/category.hooks";
import { CrudDeleteDialog } from "../../../components/crud/CrudDeleteDialog";

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

  return (
    <CrudDeleteDialog
      open={isOpen}
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onClose}
      title="Delete Category"
      description="Are you sure you want to delete this category?"
      entityName={category.name}
      entityCode={category.code}
      entityTypeLabel="Category"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      loading={deleteMutation.isPending}
      isLoading={deleteMutation.isPending}
      errorMessage={errorMessage}
      onConfirm={handleDelete}
    />
  );
}

export default CategoryDeleteDialog;
