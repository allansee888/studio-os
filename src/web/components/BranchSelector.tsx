import React, { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { useBranchStore, Branch } from "../store/branchStore";

export function BranchSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { branches, currentBranch, setCurrentBranch } = useBranchStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (branch: Branch) => {
    setCurrentBranch(branch);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Select Studio Branch"
        aria-expanded={isOpen}
      >
        <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="max-w-[120px] sm:max-w-none truncate">{currentBranch.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in-50">
          <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Studio Locations / Branches
            </p>
          </div>

          <div className="p-1 space-y-0.5 max-h-56 overflow-y-auto">
            {branches.map((b) => {
              const isSelected = b.id === currentBranch.id;
              return (
                <button
                  key={b.id}
                  onClick={() => handleSelect(b)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>{b.name}</span>
                      {b.isMain && (
                        <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1 rounded">
                          HQ
                        </span>
                      )}
                    </div>
                    {b.address && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {b.address}
                      </p>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
