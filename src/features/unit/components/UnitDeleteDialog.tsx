import React, { useState, useEffect } from "react";
import { UnitOfMeasure } from "../../../packages/types/domain";
import { useDeleteUnit } from "../index";
import { CrudDeleteDialog } from "../../../components/crud/CrudDeleteDialog";
import { toast } from "../../../packages/ui/ToastProvider";

export interface UnitDeleteDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  unit?: UnitOfMeasure | null;
  onSuccess?: (message: string) => void;
}

export function UnitDeleteDialog({
  isOpen,
  open,
  onClose,
  onOpenChange,
  unit,
  onSuccess,
}: UnitDeleteDialogProps) {
  const isDialogOpen = open !== undefined ? open : isOpen ?? false;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteMutation = useDeleteUnit();

  useEffect(() => {
    setErrorMessage(null);
  }, [unit, isDialogOpen]);

  if (!unit) return null;

  const handleClose = () => {
    setErrorMessage(null);
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const handleDelete = async () => {
    setErrorMessage(null);
    try {
      await deleteMutation.mutateAsync(unit.id);
      const successMessage = `Unit of measure "${unit.name}" (${unit.code || unit.abbreviation}) deleted successfully`;
      toast({
        title: "Unit Deleted",
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
        "Failed to delete unit of measure. It may be referenced by catalog items or orders.";
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
      title="Delete Unit of Measure"
      description="Are you sure you want to delete this unit of measure?"
      entityName={unit.name}
      entityCode={unit.code || unit.abbreviation}
      entityTypeLabel="Unit"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      loading={deleteMutation.isPending}
      isLoading={deleteMutation.isPending}
      errorMessage={errorMessage}
      onConfirm={handleDelete}
    />
  );
}

export default UnitDeleteDialog;
