import React, { useState } from "react";
import { Badge } from "../../../packages/ui/Badge";
import { Button } from "../../../packages/ui/Button";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  Eye,
  Edit,
  Trash2,
  Package,
} from "lucide-react";

export interface TreeCategoryNode {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  parentCategoryId?: string | null;
  children?: TreeCategoryNode[];
  _count?: {
    items?: number;
  };
}

interface CategoryTreeViewProps {
  categories: TreeCategoryNode[];
  onView: (category: TreeCategoryNode) => void;
  onEdit: (category: TreeCategoryNode) => void;
  onDelete: (category: TreeCategoryNode) => void;
  onAddSubcategory: (parentCategory: TreeCategoryNode) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

interface TreeNodeItemProps {
  node: TreeCategoryNode;
  level: number;
  onView: (category: TreeCategoryNode) => void;
  onEdit: (category: TreeCategoryNode) => void;
  onDelete: (category: TreeCategoryNode) => void;
  onAddSubcategory: (parentCategory: TreeCategoryNode) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

function TreeNodeItem({
  node,
  level,
  onView,
  onEdit,
  onDelete,
  onAddSubcategory,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}: TreeNodeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
          level === 0
            ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
            : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/80 my-1"
        }`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Toggle Expand */}
          {hasChildren ? (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
            >
              {isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}

          {/* Folder icon */}
          {hasChildren && isOpen ? (
            <FolderOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-slate-400 flex-shrink-0" />
          )}

          {/* Category details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {node.name}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {node.code}
              </span>
              <Badge variant={node.isActive ? "success" : "default"} className="text-[10px] px-1.5 py-0">
                {node.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {node.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {node.description}
              </p>
            )}
          </div>

          {/* Item count badge */}
          {node._count?.items !== undefined && (
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              <Package className="w-3.5 h-3.5" />
              <span>{node._count.items} items</span>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1 ml-4 flex-shrink-0">
          {canCreate && (
            <button
              onClick={() => onAddSubcategory(node)}
              title="Add Subcategory"
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onView(node)}
            title="View Details"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          {canUpdate && (
            <button
              onClick={() => onEdit(node)}
              title="Edit Category"
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete(node)}
              title="Delete Category"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Render children recursively */}
      {hasChildren && isOpen && (
        <div className="space-y-1 mt-1">
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubcategory={onAddSubcategory}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTreeView({
  categories,
  onView,
  onEdit,
  onDelete,
  onAddSubcategory,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}: CategoryTreeViewProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
        <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">No category hierarchy found</p>
        <p className="text-xs text-slate-400 mt-1">Create root categories to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((node) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          level={0}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSubcategory={onAddSubcategory}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}
