import React, { useMemo } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  Camera, 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Scissors, 
  Users,
  Settings,
  BarChart2,
  Receipt,
  LogOut,
  Search,
  Moon,
  Sun,
  Shield
} from "lucide-react";
import { Avatar } from "../../packages/ui/Avatar";
import { ToastContainer } from "../../packages/ui/ToastContainer";
import { useTheme } from "../providers/ThemeProvider";
import { useAuthStore } from "../store/authStore";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: ShoppingCart, permission: "orders.view" },
  { name: "Inventory", href: "/inventory", icon: Package, permission: "inventory.view" },
  { name: "Services", href: "/services", icon: Scissors }, // No specific permission
  { name: "Customers", href: "/customers", icon: Users, permission: "customers.view" },
  { name: "Production", href: "/production", icon: Receipt, permission: "production.view" },
  { name: "Reports", href: "/reports", icon: BarChart2, permission: "reports.view" },
  { name: "Users", href: "/users", icon: Users, permission: "users.view" },
  { name: "Roles", href: "/roles", icon: Shield, permission: "roles.view" },
  { name: "Settings", href: "/settings", icon: Settings, permission: "settings.manage" },
];

export function DashboardLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout, hasPermission } = useAuthStore();

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    logout();
    navigate("/login");
  };

  const getHeaderTitle = () => {
    const currentNavItem = navigation.find(item => 
      item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
    );
    return currentNavItem ? `${currentNavItem.name}` : 'Overview';
  };

  const filteredNavigation = useMemo(() => {
    return navigation.filter(item => {
      if (!item.permission) return true;
      return hasPermission(item.permission);
    });
  }, [hasPermission]);

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans text-slate-900 bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-white font-bold tracking-tight text-lg">StudioOS</h1>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* User profile section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <Avatar fallback={user?.firstName?.charAt(0) || 'U'} className="bg-slate-700 text-white border border-slate-600" />
            <div className="overflow-hidden flex-1">
              <p className="text-xs text-white font-medium truncate">{user?.displayName || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 flex-shrink-0 transition-colors">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{getHeaderTitle()}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input type="text" placeholder="Search..." className="w-64 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-colors" />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            </div>
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Scrollable Content Viewport */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
