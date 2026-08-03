import React from "react";
import { ShoppingCart, Users, DollarSign, Package } from "lucide-react";
import { MetricCard } from "../../packages/ui/MetricCard";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value="$45,231.89"
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: 20.1, label: "vs last month", direction: "up" }}
        />
        <MetricCard
          title="Active Orders"
          value="124"
          icon={<ShoppingCart className="w-5 h-5" />}
          trend={{ value: 4.5, label: "vs last month", direction: "up" }}
        />
        <MetricCard
          title="New Customers"
          value="32"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 12.2, label: "vs last month", direction: "down" }}
        />
        <MetricCard
          title="Low Inventory Items"
          value="18"
          icon={<Package className="w-5 h-5" />}
          trend={{ value: 2, label: "vs last month", direction: "down" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placeholders for future charts / data tables */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm min-h-[400px] flex items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Revenue Chart Area</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm min-h-[400px] flex items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Recent Activity</p>
        </div>
      </div>
    </div>
  );
}
