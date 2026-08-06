import React, { useState, useEffect } from "react";
import { Brand } from "../../../packages/types/domain";
import { useDeleteBrand } from "../hooks";
import { CrudDeleteDialog } from "../../../components/crud/CrudDeleteDialog";
import { toast } from "../../../packages/ui/ToastProvider";

export interface BrandDeleteDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  brand?: Brand | null;
  onSuccess?: (message: string) => void;
}

export function BrandDeleteDialog({
  isOpen,
  open,
  onClose,
  onOpenChange,
  brand,
  onSuccess,
}: BrandDeleteDialogProps) {
  const isDialogOpen = open !== undefined ? open : isOpen ?? false;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteMutation = useDeleteBrand();

  useEffect(() => {
    setErrorMessage(null);
  }, [brand, isDialogOpen]);

  if (!brand) return null;

  const handleClose = () => {
    setErrorMessage(null);
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const handleDelete = async () => {
    setErrorMessage(null);
    try {
      await deleteMutation.mutateAsync(brand.id);
      
      const successMessage = `Brand "${brand.name}" (${brand.code}) deleted successfully`;
      toast({
        title: "Brand Deleted",
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
        "Failed to delete brand. It may be referenced by catalog items or orders.";
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
      title="Delete Brand"
      description="Are you sure you want to delete this brand?"
      entityName={brand.name}
      entityCode={brand.code}
      entityTypeLabel="Brand"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      loading={deleteMutation.isPending}
      isLoading={deleteMutation.isPending}
      errorMessage={errorMessage}
      onConfirm={handleDelete}
    />
  );
}

export default BrandDeleteDialog;
