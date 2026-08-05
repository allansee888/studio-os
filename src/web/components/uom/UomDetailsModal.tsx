import React from "react";
import { Modal } from "../../../packages/ui/Modal";
import { Button } from "../../../packages/ui/Button";
import { Badge } from "../../../packages/ui/Badge";
import { UnitOfMeasure } from "../../../packages/types/domain";
import { Tag, Calendar, User, Package, ListOrdered, Hash } from "lucide-react";

interface UomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  uom: (UnitOfMeasure & { itemsCount?: number }) | null;
  onEdit?: () => void;
}

export function UomDetailsModal({
  isOpen,
  onClose,
  uom,
  onEdit,
}: UomDetailsModalProps) {
  if (!uom) return null;

  const formatDate = (dateString?: Date | string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unit of Measure Details">
      <div className="space-y-6">
        {/* Header summary */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{uom.name}</h3>
              <Badge variant={uom.isActive ? "success" : "default"}>
                {uom.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">
              Code: <span className="font-semibold">{uom.code}</span> | Abbr: <span className="font-semibold text-blue-600 dark:text-blue-400">{uom.abbreviation}</span>
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <Tag className="w-4 h-4 text-blue-500" />
              <span>Abbreviation</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {uom.abbreviation}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <Hash className="w-4 h-4 text-indigo-500" />
              <span>Decimal Places</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {(uom as any).decimalPlaces ?? 2}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <ListOrdered className="w-4 h-4 text-emerald-500" />
              <span>Display Order</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {uom.displayOrder}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <Package className="w-4 h-4 text-purple-500" />
              <span>Referenced Catalog Items</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {uom.itemsCount ?? 0} item(s)
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Description
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
            {uom.description || "No description provided."}
          </p>
        </div>

        {/* Metadata Audit */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created: {formatDate(uom.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Updated: {formatDate(uom.updatedAt)}</span>
          </div>
          {uom.createdBy && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Created By: {uom.createdBy}</span>
            </div>
          )}
          {uom.updatedBy && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Updated By: {uom.updatedBy}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onClose();
                onEdit();
              }}
            >
              Edit Unit
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
