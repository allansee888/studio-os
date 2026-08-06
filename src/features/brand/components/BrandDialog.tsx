import React from "react";
import { Brand } from "../../../packages/types/domain";
import { CrudDialog } from "../../../components/crud/CrudDialog";
import { BrandForm } from "./BrandForm";

export interface BrandDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  brand?: Brand | null;
  onSuccess?: (message: string) => void;
}

export function BrandDialog({
  isOpen,
  open,
  onClose,
  onOpenChange,
  brand,
  onSuccess,
}: BrandDialogProps) {
  const isDialogOpen = open !== undefined ? open : isOpen ?? false;
  const isEditing = !!brand;

  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const handleFormSuccess = (message: string) => {
    onSuccess?.(message);
    handleClose();
  };

  return (
    <CrudDialog
      isOpen={isDialogOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Brand" : "Create Brand"}
      description={
        isEditing
          ? "Modify the brand details, website, and status."
          : "Add a new brand to categorize items across your catalog."
      }
      className="max-w-lg"
    >
      <BrandForm
        brand={brand}
        onSuccess={handleFormSuccess}
        onCancel={handleClose}
      />
    </CrudDialog>
  );
}

export default BrandDialog;
