import React from "react";
import { 
  DollarSign, 
  ShoppingCart, 
  Receipt, 
  Package, 
  Activity, 
  Clock, 
  PlusCircle, 
  UserPlus, 
  ArrowUpRight,
  Building2
} from "lucide-react";
import { MetricCard } from "../../packages/ui/MetricCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../packages/ui/Card";
import { Badge } from "../../packages/ui/Badge";
import { Button } from "../../packages/ui/Button";
import { useAuthStore } from "../store/authStore";
import { useBranchStore } from "../store/branchStore";
import { Link } from "react-router-dom";

export function Dashboard() {
  const { user } = useAuthStore();
  const { currentBranch } = useBranchStore();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  const recentActivity = [
    {
      id: "act-1",
      title: "Order ORD-2026-000104 created",
      subtitle: "Customer: Acme Studio (CUS-2026-000012)",
      time: "10 minutes ago",
      type: "order",
      badge: "ORD-2026-000104"
    },
    {
      id: "act-2",
      title: "Payment RCP-2026-000089 recorded ($150.00)",
      subtitle: "Method: Credit Card • Staff: Admin User",
      time: "32 minutes ago",
      type: "payment",
      badge: "RCP-2026-000089"
    },
    {
      id: "act-3",
      title: "Production Job JOB-2026-000042 advanced",
      subtitle: "Step: Printing -> Packaging • Assigned: Production Lead",
      time: "1 hour ago",
      type: "production",
      badge: "JOB-2026-000042"
    },
    {
      id: "act-4",
      title: "Stock Movement IN (+200 Photo Paper Premium A4)",
      subtitle: "Supplier: Fuji Film Distributors • Ref: IN-2026-008",
      time: "2 hours ago",
      type: "inventory",
      badge: "Stock IN"
    },
    {
      id: "act-5",
      title: "New Customer registered",
      subtitle: "Name: Sarah Jenkins (CUS-2026-000055)",
      time: "3 hours ago",
      type: "customer",
      badge: "CUS-2026-000055"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Top Banner / Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Welcome back, {user?.firstName || user?.displayName || "Studio Staff"}!
            </h1>
            <Badge variant="outline" className="flex items-center gap-1.5 text-xs font-normal">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              {currentBranch.name}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Studio Operations Overview • {formattedDate}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/orders">
            <Button size="sm" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              New Order
            </Button>
          </Link>
          <Link to="/customers">
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Add Customer
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Placeholder Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Today's Sales */}
        <MetricCard
          title="Today's Sales"
          value="$1,840.50"
          icon={<DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          trend={{ value: 12.5, label: "vs yesterday", direction: "up" }}
        />

        {/* 2. Orders in Progress */}
        <MetricCard
          title="Orders in Progress"
          value="14"
          icon={<ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          trend={{ value: 3, label: "new orders today", direction: "up" }}
        />

        {/* 3. Pending Production Jobs */}
        <MetricCard
          title="Pending Production Jobs"
          value="8"
          icon={<Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          trend={{ value: 2, label: "due today", direction: "neutral" }}
        />

        {/* 4. Low Stock Items */}
        <MetricCard
          title="Low Stock Items"
          value="5"
          icon={<Package className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          trend={{ value: 2, label: "require reorder", direction: "down" }}
        />
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5. Recent Activity Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Recent Activity
              </CardTitle>
              <CardDescription>Real-time log of orders, payments, production, and stock updates</CardDescription>
            </div>
            <Link to="/reports" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivity.map((act) => (
                <div key={act.id} className="py-3.5 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{act.title}</p>
                      <Badge variant="default" className="text-[10px] font-mono py-0 px-1.5">
                        {act.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{act.subtitle}</p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Operations & Status Overview */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Workflow Quick Actions</CardTitle>
            <CardDescription>Shortcut to studio core operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link 
              to="/orders" 
              className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">POS & Orders</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Create order, record payment</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </Link>

            <Link 
              to="/production" 
              className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-md">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">Production Queue</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Track and advance job steps</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </Link>

            <Link 
              to="/inventory" 
              className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-md">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">Inventory & Stock</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manage levels & stock IN/OUT</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
