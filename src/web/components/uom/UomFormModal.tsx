import React, { useState, useEffect } from "react";
import { Modal } from "../../../packages/ui/Modal";
import { Button } from "../../../packages/ui/Button";
import { Input } from "../../../packages/ui/Input";
import { Textarea } from "../../../packages/ui/Textarea";
import { Checkbox } from "../../../packages/ui/Checkbox";
import { UnitOfMeasure } from "../../../packages/types/domain";

interface UomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  uom?: UnitOfMeasure | null;
}

export function UomFormModal({
  isOpen,
  onClose,
  onSuccess,
  uom,
}: UomFormModalProps) {
  const isEditing = !!uom;

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (uom) {
      setCode(uom.code || "");
      setName(uom.name || "");
      setAbbreviation(uom.abbreviation || "");
      setDescription(uom.description || "");
      setDisplayOrder(uom.displayOrder ?? 0);
      setIsActive(uom.isActive ?? true);
    } else {
      setCode("");
      setName("");
      setAbbreviation("");
      setDescription("");
      setDisplayOrder(0);
      setIsActive(true);
    }
    setErrors({});
    setGeneralError(null);
  }, [uom, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = "Unit name is required";
    }
    if (!abbreviation.trim()) {
      newErrors.abbreviation = "Abbreviation is required";
    } else if (abbreviation.trim().length > 20) {
      newErrors.abbreviation = "Abbreviation cannot exceed 20 characters";
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
      abbreviation: abbreviation.trim(),
      description: description.trim() || undefined,
      displayOrder: Number(displayOrder) || 0,
      isActive,
    };

    try {
      const url = isEditing ? `/api/v1/units/${uom.id}` : "/api/v1/units";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details?.[0] || "Failed to save Unit of Measure");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setGeneralError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Unit of Measure" : "Create Unit of Measure"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {generalError && (
          <div className="p-3 text-sm rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            {generalError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Unit Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Piece, Pack, Box"
              error={errors.name}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Abbreviation <span className="text-rose-500">*</span>
            </label>
            <Input
              value={abbreviation}
              onChange={(e) => setAbbreviation(e.target.value)}
              placeholder="e.g., pc, pack, box, btl"
              error={errors.abbreviation}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Code <span className="text-slate-400 font-normal">(Auto-generated if blank)</span>
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., UOM-PCS"
              error={errors.code}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Display Order
            </label>
            <Input
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description of this unit of measure..."
            rows={3}
          />
        </div>

        <div className="pt-2">
          <Checkbox
            id="uom-is-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            label="Active (Available for catalog items, inventory, and purchasing)"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Unit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
