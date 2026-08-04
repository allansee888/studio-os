import React, { useState, useEffect, useMemo } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  Camera, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  Search, 
  X,
  Building2,
  LogOut
} from "lucide-react";
import { ToastContainer } from "../../packages/ui/ToastContainer";
import { Breadcrumbs } from "../../packages/ui/Breadcrumbs";
import { useAuthStore } from "../store/authStore";
import { navigationConfig, NavGroup, NavItem } from "../config/navigation";
import { getBreadcrumbsForPath } from "../utils/breadcrumbs";
import { QuickSearchModal } from "../components/QuickSearchModal";
import { NotificationsPopover } from "../components/NotificationsPopover";
import { UserProfileMenu } from "../components/UserProfileMenu";
import { BranchSelector } from "../components/BranchSelector";

export function DashboardLayout() {
  const { pathname } = useLocation();
  const { hasPermission } = useAuthStore();

  // Sidebar Collapsed State (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("studioos_sidebar_collapsed");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Mobile Drawer Open State
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Quick Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Persist collapse state
  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("studioos_sidebar_collapsed", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle ESC key for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  // Filter navigation by permissions
  const filteredNavGroups = useMemo(() => {
    return navigationConfig
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (!item.permission) return true;
          return hasPermission(item.permission);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [hasPermission]);

  const breadcrumbs = useMemo(() => getBreadcrumbsForPath(pathname), [pathname]);

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans text-slate-900 bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* ================= SIDEBAR (Desktop) ================= */}
      <aside
        className={`hidden md:flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 flex-shrink-0 relative ${
          isCollapsed ? "w-20" : "w-64"
        }`}
        aria-label="Desktop Navigation"
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
          <Link to="/" className="flex items-center gap-3 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-white font-bold tracking-tight text-lg leading-tight">StudioOS</h1>
                <p className="text-[10px] text-slate-400 tracking-wide uppercase font-semibold">ERP Platform</p>
              </div>
            )}
          </Link>

          <button
            onClick={toggleSidebar}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto" role="navigation">
          {filteredNavGroups.map((group) => (
            <div key={group.id} className="space-y-1">
              {!isCollapsed && (
                <h2 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {group.title}
                </h2>
              )}
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isActive
                        ? "bg-blue-600 text-white font-medium shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                    } ${isCollapsed ? "justify-center" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* ================= MOBILE NAVIGATION DRAWER ================= */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative flex-1 max-w-xs w-full bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <Camera className="w-4 h-4" />
                </div>
                <h1 className="text-white font-bold tracking-tight text-lg">StudioOS</h1>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                aria-label="Close mobile menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto" role="navigation">
              {filteredNavGroups.map((group) => (
                <div key={group.id} className="space-y-1">
                  <h2 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {group.title}
                  </h2>
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          isActive
                            ? "bg-blue-600 text-white font-medium"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Global Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 transition-colors z-20">
          
          {/* Left Header Section: Mobile Menu Toggle + Branch Selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Branch Selector Dropdown */}
            <BranchSelector />
          </div>

          {/* Right Header Section: Search, Notifications, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Bar */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-lg text-xs text-slate-500 dark:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Open quick search"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Search studio...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Popover */}
            <NotificationsPopover />

            {/* User Profile Menu */}
            <UserProfileMenu />
          </div>
        </header>

        {/* Sub-Header Breadcrumb Bar */}
        <div className="bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 transition-colors">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Scrollable Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto focus:outline-none" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      {/* Quick Search Modal */}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <ToastContainer />
    </div>
  );
}
