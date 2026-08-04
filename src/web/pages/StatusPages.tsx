import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Lock, FileQuestion, RefreshCw, Home } from "lucide-react";
import { Button } from "../../packages/ui/Button";

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">Page Not Found</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm mb-8 leading-relaxed">
        The requested resource or document path does not exist or has been moved within StudioOS.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/">
          <Button className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function Forbidden() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <Lock className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2">403</h1>
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">Access Forbidden</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm mb-8 leading-relaxed">
        You do not have permission to access this module or execute this operation. Contact your system administrator for access rights.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <Lock className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2">401</h1>
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">Authentication Required</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm mb-8 leading-relaxed">
        Your active session has expired or authentication credentials are required to continue using StudioOS.
      </p>
      <Link to="/login">
        <Button className="flex items-center gap-2">
          Sign In Again
        </Button>
      </Link>
    </div>
  );
}

export function ServerError() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2">500</h1>
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">Internal Server Error</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm mb-8 leading-relaxed">
        An unexpected error occurred while processing your request. The technical details have been logged for diagnosis.
      </p>
      <div className="flex items-center gap-3">
        <Button 
          onClick={() => window.location.reload()} 
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Page
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </Button>
      </div>
    </div>
  );
}
