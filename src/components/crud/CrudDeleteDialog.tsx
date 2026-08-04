import React from "react";
import { Modal } from "../../packages/ui/Modal";
import { Button } from "../../packages/ui/Button";
import { AlertTriangle, AlertCircle } from "lucide-react";

export interface CrudDeleteDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title?: string;
  description?: string;
  entityName: string;
  entityCode?: string;
  entityTypeLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  isLoading?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function CrudDeleteDialog({
  open,
  isOpen,
  onOpenChange,
  onClose,
  title = "Delete Item",
  description = "Are you sure you want to delete this record?",
  entityName,
  entityCode,
  entityTypeLabel,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  isLoading = false,
  errorMessage,
  onConfirm,
  onCancel,
  className = "max-w-md",
}: CrudDeleteDialogProps) {
  const isDialogOpen = open !== undefined ? open : isOpen ?? false;
  const isDeleting = loading || isLoading;

  const handleClose = () => {
    if (isDeleting) return;
    if (onCancel) {
      onCancel();
    }
    if (onClose) {
      onClose();
    }
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    } else if (e.key === "Enter" && !isDeleting) {
      e.preventDefault();
      onConfirm();
    }
  };

  if (!isDialogOpen) return null;

  const nameLabel = entityTypeLabel ? `${entityTypeLabel} Name` : "Name";
  const codeLabel = entityTypeLabel ? `${entityTypeLabel} Code` : "Code";

  return (
    <Modal
      isOpen={isDialogOpen}
      onClose={handleClose}
      className={className}
    >
      <div className="space-y-4" onKeyDown={handleKeyDown} tabIndex={-1}>
        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-full shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
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

        {/* Entity Details Card */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">{nameLabel}:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{entityName}</span>
          </div>
          {entityCode && (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{codeLabel}:</span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{entityCode}</span>
            </div>
          )}
        </div>

        {/* Warning Statement */}
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          Warning: This action cannot be undone.
        </p>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isDeleting}
            disabled={isDeleting}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CrudDeleteDialog;
