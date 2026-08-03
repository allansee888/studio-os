import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../packages/ui/Table";
import { Button } from "../../packages/ui/Button";
import { Badge } from "../../packages/ui/Badge";
import { Breadcrumbs } from "../../packages/ui/Breadcrumbs";
import { Shield, Edit } from "lucide-react";

export function Roles() {
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/roles");
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumbs items={[{ label: "Roles & Permissions" }]} />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">Roles & Permissions</h1>
        </div>
        <Button className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading roles...</div>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {role.name}
                    {role.isSystem && <Badge variant="info">System</Badge>}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{role.description || "No description"}</p>
                </div>
                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 bg-slate-50/50 dark:bg-slate-900/50 flex-1">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Permissions ({role.rolePermissions.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {role.rolePermissions.slice(0, 8).map((rp: any) => (
                    <Badge key={rp.permission.id} variant="default" className="text-[10px] font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none">
                      {rp.permission.name}
                    </Badge>
                  ))}
                  {role.rolePermissions.length > 8 && (
                    <Badge variant="outline" className="text-[10px] font-medium px-2 py-1 border-dashed">
                      +{role.rolePermissions.length - 8} more
                    </Badge>
                  )}
                  {role.rolePermissions.length === 0 && (
                    <span className="text-sm text-slate-400 italic">No permissions assigned</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
