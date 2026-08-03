/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from './web/providers/ThemeProvider';
import { DashboardLayout } from './web/layouts/DashboardLayout';
import { AuthLayout } from './web/layouts/AuthLayout';
import { Login } from './web/pages/Login';
import { Dashboard } from './web/pages/Dashboard';
import { Users } from './web/pages/Users';
import { Roles } from './web/pages/Roles';
import { EmptyModulePlaceholder } from './web/pages/EmptyModulePlaceholder';
import { NotFound, Unauthorized } from './web/pages/StatusPages';
import { useAuthStore } from './web/store/authStore';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function RequirePermission({ permission, children }: { permission: string, children: React.ReactNode }) {
  const { hasPermission, isLoading } = useAuthStore();
  
  if (isLoading) return null;

  if (!hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

function AuthInit({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore(state => state.setAuth);
  
  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setAuth(data.user);
        } else {
          setAuth(null);
        }
      })
      .catch(() => setAuth(null));
  }, [setAuth]);

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthInit>
          <BrowserRouter>
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
              </Route>
              
              <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                
                <Route path="users" element={<RequirePermission permission="users.view"><Users /></RequirePermission>} />
                <Route path="roles" element={<RequirePermission permission="roles.view"><Roles /></RequirePermission>} />

                <Route path="orders" element={<RequirePermission permission="orders.view"><EmptyModulePlaceholder title="Orders" /></RequirePermission>} />
                <Route path="inventory" element={<RequirePermission permission="inventory.view"><EmptyModulePlaceholder title="Inventory" /></RequirePermission>} />
                <Route path="services" element={<EmptyModulePlaceholder title="Services" />} />
                <Route path="customers" element={<RequirePermission permission="customers.view"><EmptyModulePlaceholder title="Customers" /></RequirePermission>} />
                <Route path="production" element={<RequirePermission permission="production.view"><EmptyModulePlaceholder title="Production" /></RequirePermission>} />
                <Route path="reports" element={<RequirePermission permission="reports.view"><EmptyModulePlaceholder title="Reports" /></RequirePermission>} />
                <Route path="settings" element={<RequirePermission permission="settings.manage"><EmptyModulePlaceholder title="Settings" /></RequirePermission>} />
              </Route>
              
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthInit>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
