import React from "react";
import { Modal } from "../../../packages/ui/Modal";
import { Category } from "../../../packages/types/domain";
import { CategoryForm } from "./CategoryForm";

export interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSuccess?: (message: string) => void;
}

export function CategoryDialog({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryDialogProps) {
  const isEditing = !!category;

  const handleFormSuccess = (message: string) => {
    onSuccess?.(message);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Category" : "Create New Category"}
      description={
        isEditing
          ? "Modify the category details, hierarchy, and status."
          : "Add a new category to organize products or services in your catalog."
      }
      className="max-w-lg"
    >
      <CategoryForm
        category={category}
        onSuccess={handleFormSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
}

export default CategoryDialog;
