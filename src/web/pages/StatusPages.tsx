import React from "react";
import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-slate-700 mb-6">Page Not Found</h2>
      <p className="text-slate-500 max-w-md text-center mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 text-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

export function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-slate-900 mb-4">401</h1>
      <h2 className="text-2xl font-semibold text-slate-700 mb-6">Unauthorized Access</h2>
      <p className="text-slate-500 max-w-md text-center mb-8">
        You don't have permission to view this page. Please contact your administrator.
      </p>
      <Link 
        to="/login" 
        className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 text-sm"
      >
        Sign In
      </Link>
    </div>
  );
}
