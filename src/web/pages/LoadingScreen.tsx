import React from "react";
import { Spinner } from "../../packages/ui/Spinner";
import { Camera } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-6">
        <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
          <Camera className="h-10 w-10 text-white" />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-slate-500">Loading StudioOS...</p>
        </div>
      </div>
    </div>
  );
}
