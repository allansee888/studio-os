import React, { useState, useEffect } from "react";
import { Product } from "../../../packages/types/domain";
import { useDeleteProduct } from "../hooks";
import { CrudDeleteDialog } from "../../../components/crud/CrudDeleteDialog";
import { toast } from "../../../packages/ui/ToastProvider";

export interface ProductDeleteDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  product?: Product | null;
  onSuccess?: (message: string) => void;
}

export function ProductDeleteDialog({
  isOpen,
  open,
  onClose,
  onOpenChange,
  product,
  onSuccess,
}: ProductDeleteDialogProps) {
  const isDialogOpen = open !== undefined ? open : isOpen ?? false;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteMutation = useDeleteProduct();

  useEffect(() => {
    setErrorMessage(null);
  }, [product, isDialogOpen]);

  if (!product) return null;

  const handleClose = () => {
    setErrorMessage(null);
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const handleDelete = async () => {
    setErrorMessage(null);

    try {
      await deleteMutation.mutateAsync(product.id);
      
      const successMessage = `Product "${product.name}" (${product.sku}) deleted successfully`;
      toast({
        title: "Product Deleted",
        description: successMessage,
        type: "success",
      });
      
      if (onSuccess) {
        onSuccess(successMessage);
      }
      handleClose();
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.error ||
        "Failed to delete product. It may be referenced by orders or inventory.";
      setErrorMessage(msg);
      toast({
        title: "Deletion Failed",
        description: msg,
        type: "error",
      });
    }
  };

  return (
    <CrudDeleteDialog
      open={isDialogOpen}
      isOpen={isDialogOpen}
      onClose={handleClose}
      onCancel={handleClose}
      title="Delete Product"
      description="Are you sure you want to delete this product? This action cannot be undone."
      entityName={product.name}
      entityCode={product.sku}
      entityTypeLabel="Product"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      loading={deleteMutation.isPending}
      isLoading={deleteMutation.isPending}
      errorMessage={errorMessage}
      onConfirm={handleDelete}
    />
  );
}

export default ProductDeleteDialog;
