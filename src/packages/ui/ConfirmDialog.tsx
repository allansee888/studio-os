import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md"
    >
      <div className="sm:flex sm:items-start">
        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${isDestructive ? 'bg-red-100' : 'bg-blue-100'}`}>
          <AlertTriangle className={`h-6 w-6 ${isDestructive ? 'text-red-600' : 'text-blue-600'}`} aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <h3 className="text-lg font-semibold leading-6 text-slate-900">{title}</h3>
          <div className="mt-2">
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 sm:mt-8 sm:flex sm:flex-row-reverse space-y-3 sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
        <Button
          variant={isDestructive ? "danger" : "primary"}
          onClick={onConfirm}
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          {confirmText}
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="w-full sm:w-auto mt-3 sm:mt-0"
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
}
