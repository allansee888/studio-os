import React from "react";
import { Outlet } from "react-router-dom";
import { Camera } from "lucide-react";
import { ToastContainer } from "../../packages/ui/ToastContainer";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <Camera className="h-10 w-10 text-white transform rotate-6" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          StudioOS
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Run your studio. Not your paperwork.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-200 dark:border-slate-800">
          <Outlet />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
