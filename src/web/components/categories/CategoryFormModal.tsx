import React, { useState, useEffect } from "react";
import { Modal } from "../../../packages/ui/Modal";
import { Button } from "../../../packages/ui/Button";
import { Input } from "../../../packages/ui/Input";
import { Textarea } from "../../../packages/ui/Textarea";
import { Select } from "../../../packages/ui/Select";
import { Checkbox } from "../../../packages/ui/Checkbox";
import { Category } from "../../../packages/types/domain";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category | null;
  categories: Category[]; // List of all categories for parent selector
  defaultParentId?: string | null;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  category,
  categories,
  defaultParentId,
}: CategoryFormModalProps) {
  const isEditing = !!category;

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<string>("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setCode(category.code || "");
      setName(category.name || "");
      setDescription(category.description || "");
      setParentCategoryId(category.parentCategoryId || "");
      setDisplayOrder(category.displayOrder ?? 0);
      setIsActive(category.isActive ?? true);
    } else {
      setCode("");
      setName("");
      setDescription("");
      setParentCategoryId(defaultParentId || "");
      setDisplayOrder(0);
      setIsActive(true);
    }
    setErrors({});
    setGeneralError(null);
  }, [category, defaultParentId, isOpen]);

  // Filter out the category itself and its descendants from eligible parents to prevent circular references
  const getEligibleParents = () => {
    if (!category) return categories;

    // Helper to collect all descendant IDs
    const descendantIds = new Set<string>([category.id]);
    const addChildren = (parentId: string) => {
      categories.forEach((cat) => {
        if (cat.parentCategoryId === parentId && !descendantIds.has(cat.id)) {
          descendantIds.add(cat.id);
          addChildren(cat.id);
        }
      });
    };
    addChildren(category.id);

    return categories.filter((cat) => !descendantIds.has(cat.id));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = "Category name is required";
    }
    if (code && code.trim().length > 50) {
      newErrors.code = "Code cannot exceed 50 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError(null);

    const payload = {
      code: code.trim() ? code.trim().toUpperCase() : undefined,
      name: name.trim(),
      description: description.trim() || null,
      parentCategoryId: parentCategoryId || null,
      displayOrder: Number(displayOrder) || 0,
      isActive,
    };

    try {
      const url = isEditing ? `/api/v1/categories/${category.id}` : "/api/v1/categories";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details?.join(", ") || "Failed to save category");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setGeneralError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const eligibleParents = getEligibleParents();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Category" : "Create New Category"}
      description={
        isEditing
          ? "Update category details and hierarchical organization."
          : "Add a new category to organize physical products or services."
      }
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {generalError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {generalError}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Category Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Photo Printing, ID Photos, Frames"
            required
            error={errors.name}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Category Code
          </label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. CAT-001 (auto-generated if empty)"
            error={errors.code}
          />
          <p className="text-xs text-slate-500 mt-1">
            Must be unique. Leave blank to generate automatically.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Parent Category
          </label>
          <Select
            value={parentCategoryId}
            onChange={(e) => setParentCategoryId(e.target.value)}
          >
            <option value="">None (Top-Level Category)</option>
            {eligibleParents.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.code} - {cat.name}
              </option>
            ))}
          </Select>
          <p className="text-xs text-slate-500 mt-1">
            Nest under an existing parent category for unlimited hierarchy.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief details about what items belong in this category..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Display Order
            </label>
            <Input
              type="number"
              min="0"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
              placeholder="0"
            />
          </div>

          <div className="flex items-center pt-6">
            <Checkbox
              id="isActiveCategory"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              label="Active Status"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
