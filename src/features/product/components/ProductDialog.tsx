import React from "react";
import { Product } from "../../../packages/types/domain";
import { CrudDialog } from "../../../components/crud/CrudDialog";
import { ProductForm } from "./ProductForm";

export interface ProductDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  product?: Product | null;
  onSuccess?: (message: string) => void;
}

export function ProductDialog({
  isOpen,
  open,
  onClose,
  onOpenChange,
  product,
  onSuccess,
}: ProductDialogProps) {
  const isDialogOpen = open !== undefined ? open : isOpen ?? false;
  const isEditing = !!product;

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
      title={isEditing ? "Edit Product" : "Create Product"}
      description={
        isEditing
          ? "Modify the product details, pricing, and inventory settings."
          : "Add a new product to your catalog."
      }
      className="max-w-2xl"
    >
      <ProductForm
        product={product}
        onSuccess={handleFormSuccess}
        onCancel={handleClose}
      />
    </CrudDialog>
  );
}

export default ProductDialog;
