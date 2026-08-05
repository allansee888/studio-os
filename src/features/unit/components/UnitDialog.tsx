import React from "react";
import { UnitOfMeasure } from "../../../packages/types/domain";
import { CrudDialog } from "../../../components/crud/CrudDialog";
import { UnitForm } from "./UnitForm";

export interface UnitDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  unit?: UnitOfMeasure | null;
  onSuccess?: (message: string) => void;
}

export function UnitDialog({
  isOpen,
  open,
  onClose,
  onOpenChange,
  unit,
  onSuccess,
}: UnitDialogProps) {
  const isDialogOpen = open !== undefined ? open : isOpen ?? false;
  const isEditing = !!unit;

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
      title={isEditing ? "Edit Unit of Measure" : "Create Unit of Measure"}
      description={
        isEditing
          ? "Modify the unit details, abbreviation, and status."
          : "Add a new unit of measure to standard items across your catalog."
      }
      className="max-w-lg"
    >
      <UnitForm
        unit={unit}
        onSuccess={handleFormSuccess}
        onCancel={handleClose}
      />
    </CrudDialog>
  );
}

export default UnitDialog;
