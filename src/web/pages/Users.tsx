import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../packages/ui/Table";
import { Button } from "../../packages/ui/Button";
import { Badge } from "../../packages/ui/Badge";
import { Breadcrumbs } from "../../packages/ui/Breadcrumbs";
import { UserPlus, MoreHorizontal, Edit, Trash } from "lucide-react";

export function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/users");
      const data = await res.json();
      setUsers(data);
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
          <Breadcrumbs items={[{ label: "Users" }]} />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">User Management</h1>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading users...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">No users found</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    {user.displayName}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">{user.email}</TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">{user.department || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.userRoles?.map((ur: any) => (
                        <Badge key={ur.role.id} variant="outline" className="text-xs">
                          {ur.role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Active" ? "success" : "warning"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 text-slate-400">
                      <button className="p-2 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-slate-800">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
