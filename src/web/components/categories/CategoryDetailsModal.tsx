import React from "react";
import { Modal } from "../../../packages/ui/Modal";
import { Button } from "../../../packages/ui/Button";
import { Badge } from "../../../packages/ui/Badge";
import { Category } from "../../../packages/types/domain";
import { FolderTree, Calendar, User, Package, Hash, Layers } from "lucide-react";

interface CategoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: (Category & { parent?: any; children?: any[]; _count?: { items?: number; children?: number } }) | null;
  onEdit?: (category: Category) => void;
}

export function CategoryDetailsModal({
  isOpen,
  onClose,
  category,
  onEdit,
}: CategoryDetailsModalProps) {
  if (!category) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Category Details"
      className="max-w-md"
    >
      <div className="space-y-5 pt-2">
        {/* Header Badge & Name */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{category.name}</h3>
              <Badge variant={category.isActive ? "success" : "default"}>
                {category.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5" />
              {category.code}
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            {category.description || "No description provided."}
          </p>
        </div>

        {/* Hierarchy Information */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <FolderTree className="w-3.5 h-3.5" /> Parent Category
            </span>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {category.parent ? (
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{category.parent.name}</span>
              ) : (
                <span className="text-slate-400 italic">Top-Level Root</span>
              )}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <Layers className="w-3.5 h-3.5" /> Display Order
            </span>
            <p className="font-medium text-slate-800 dark:text-slate-200">{category.displayOrder ?? 0}</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/40">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mb-1">
              <Layers className="w-3.5 h-3.5" /> Subcategories
            </span>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {category.children?.length ?? category._count?.children ?? 0}
            </p>
          </div>

          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mb-1">
              <Package className="w-3.5 h-3.5" /> Catalog Items
            </span>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {category._count?.items ?? 0}
            </p>
          </div>
        </div>

        {/* Subcategories preview */}
        {category.children && category.children.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Direct Subcategories</h4>
            <div className="flex flex-wrap gap-1.5">
              {category.children.map((sub: any) => (
                <Badge key={sub.id} variant="outline" className="text-xs font-normal">
                  {sub.name} ({sub.code})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Audit Meta */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Created
            </span>
            <span>{category.createdAt ? new Date(category.createdAt).toLocaleString() : "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Created By
            </span>
            <span>{category.createdBy || "System"}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onClose();
                onEdit(category);
              }}
            >
              Edit Category
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
