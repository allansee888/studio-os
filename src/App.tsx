/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from './web/providers/ThemeProvider';
import { DashboardLayout } from './web/layouts/DashboardLayout';
import { AuthLayout } from './web/layouts/AuthLayout';
import { Login } from './web/pages/Login';
import { Dashboard } from './web/pages/Dashboard';
import { Users } from './web/pages/Users';
import { Roles } from './web/pages/Roles';
import { CategoryListPage } from './web/pages/CategoryListPage';
import { UnitListPage } from './features/unit/pages/UnitListPage';
import { EmptyModulePlaceholder } from './web/pages/EmptyModulePlaceholder';
import { LoadingScreen } from './web/pages/LoadingScreen';
import { NotFound, Unauthorized, Forbidden, ServerError } from './web/pages/StatusPages';
import { RouteGuard } from './web/components/RouteGuard';
import { useAuthStore } from './web/store/authStore';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AuthInit({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <Login />
                    </PublicOnlyRoute>
                  }
                />
              </Route>
              
              <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                
                <Route path="users" element={<RouteGuard permission="users:view"><Users /></RouteGuard>} />
                <Route path="roles" element={<RouteGuard permission="roles:view"><Roles /></RouteGuard>} />
                <Route path="categories" element={<RouteGuard permissions={["category.view", "catalog.category.view"]}><CategoryListPage /></RouteGuard>} />
                <Route path="catalog/categories" element={<RouteGuard permissions={["category.view", "catalog.category.view"]}><CategoryListPage /></RouteGuard>} />
                <Route path="units" element={<RouteGuard permission="unit.view"><UnitListPage /></RouteGuard>} />
                <Route path="catalog/units" element={<RouteGuard permission="unit.view"><UnitListPage /></RouteGuard>} />

                <Route path="orders" element={<RouteGuard permission="orders:view"><EmptyModulePlaceholder title="Orders" /></RouteGuard>} />
                <Route path="inventory" element={<RouteGuard permission="inventory:view"><EmptyModulePlaceholder title="Inventory" /></RouteGuard>} />
                <Route path="services" element={<RouteGuard permission="services:view"><EmptyModulePlaceholder title="Services" /></RouteGuard>} />
                <Route path="customers" element={<RouteGuard permission="customers:view"><EmptyModulePlaceholder title="Customers" /></RouteGuard>} />
                <Route path="production" element={<RouteGuard permission="production:view"><EmptyModulePlaceholder title="Production" /></RouteGuard>} />
                <Route path="reports" element={<RouteGuard permission="reports:view"><EmptyModulePlaceholder title="Reports" /></RouteGuard>} />
                <Route path="settings" element={<RouteGuard permission="settings:manage"><EmptyModulePlaceholder title="Settings" /></RouteGuard>} />
              </Route>
              
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/forbidden" element={<Forbidden />} />
              <Route path="/500" element={<ServerError />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthInit>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
