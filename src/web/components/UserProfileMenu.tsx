import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Settings, LogOut, Moon, Sun, Shield, ChevronDown } from "lucide-react";
import { Avatar } from "../../packages/ui/Avatar";
import { Badge } from "../../packages/ui/Badge";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../providers/ThemeProvider";

export function UserProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    logout();
    navigate("/login");
  };

  const userRole = user?.roles?.[0] || user?.role || "Staff";
  const userInitial = user?.firstName?.charAt(0) || user?.displayName?.charAt(0) || "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="User profile menu"
        aria-expanded={isOpen}
      >
        <Avatar
          fallback={userInitial}
          className="h-8 w-8 bg-blue-600 text-white font-semibold text-xs border border-blue-500"
        />
        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
            {user?.displayName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User"}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
            {typeof userRole === "string" ? userRole : "Staff"}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in-50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <Avatar
                fallback={userInitial}
                className="h-10 w-10 bg-blue-600 text-white font-semibold border border-blue-500"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user?.displayName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <div className="mt-1">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5">
                    {typeof userRole === "string" ? userRole : "Staff"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
                Theme
              </span>
              <span className="text-[10px] text-slate-400 capitalize">{theme}</span>
            </button>

            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              Settings
            </Link>
          </div>

          <div className="p-1.5 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
