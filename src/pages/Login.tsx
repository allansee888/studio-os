import React from 'react';
import { useAuth } from '../components/AuthProvider';
import { Camera } from 'lucide-react';

export default function Login() {
  const { signIn, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <Camera className="h-10 w-10 text-white transform rotate-6" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          StudioManager
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access your business dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <button
            onClick={signIn}
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Connecting...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    </div>
  );
}
