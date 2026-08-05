import React from "react";
import { Modal } from "../../packages/ui/Modal";
import { Button } from "../../packages/ui/Button";

export interface CrudDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function CrudDialog({
  isOpen,
  open,
  onClose,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className = "max-w-lg",
}: CrudDialogProps) {
  const isDialogOpen = open !== undefined ? open : isOpen ?? false;

  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  if (!isDialogOpen) return null;

  return (
    <Modal
      isOpen={isDialogOpen}
      onClose={handleClose}
      title={title}
      description={description}
      footer={footer}
      className={className}
    >
      {children}
    </Modal>
  );
}

export interface CrudDialogHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function CrudDialogHeader({
  title,
  description,
  className = "mb-4 space-y-1.5",
}: CrudDialogHeaderProps) {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
    </div>
  );
}

export interface CrudDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CrudDialogFooter({
  children,
  className = "mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800",
}: CrudDialogFooterProps) {
  return <div className={className}>{children}</div>;
}

export interface CrudFormActionsProps {
  onCancel?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function CrudFormActions({
  onCancel,
  cancelLabel = "Cancel",
  submitLabel = "Save Changes",
  isLoading = false,
  disabled = false,
}: CrudFormActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || disabled}
        >
          {cancelLabel}
        </Button>
      )}
      <Button
        type="submit"
        isLoading={isLoading}
        disabled={isLoading || disabled}
      >
        {submitLabel}
      </Button>
    </div>
  );
}

export default CrudDialog;
