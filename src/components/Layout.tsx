import { LayoutDashboard, ShoppingCart, Package, Scissors, Users, Truck, Receipt, DollarSign, BarChart2, Settings, UserCircle, LogOut, Camera, Search } from 'lucide-react';
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'POS', href: '/pos', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Services', href: '/services', icon: Scissors },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Suppliers', href: '/suppliers', icon: Truck },
  { name: 'Purchasing', href: '/purchasing', icon: Receipt },
  { name: 'Expenses', href: '/expenses', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  // Helper to determine the header title based on current path
  const getHeaderTitle = () => {
    const currentNavItem = navigation.find(item => 
      item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
    );
    return currentNavItem ? `${currentNavItem.name} Overview` : 'Dashboard Overview';
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans text-slate-900 bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-white font-bold tracking-tight text-lg">StudioPro</h1>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
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
            {user?.photoURL ? (
              <img className="w-8 h-8 rounded-full" src={user.photoURL} alt="" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-medium">
                {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'US'}
              </div>
            )}
            <div className="overflow-hidden flex-1">
              <p className="text-xs text-white font-medium truncate">{user?.displayName || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-800">{getHeaderTitle()}</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <input type="text" placeholder="Search sales or SKU..." className="w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 whitespace-nowrap">
              + New Sale
            </button>
          </div>
        </header>

        {/* Scrollable Content Viewport */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
