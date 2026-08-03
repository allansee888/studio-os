import React, { useState } from "react";
import { Button } from "../../packages/ui/Button";
import { Input } from "../../packages/ui/Input";
import { Checkbox } from "../../packages/ui/Checkbox";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setAuth(data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleLogin}>
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Email address
        </label>
        <div className="mt-1">
          <Input 
            id="email" 
            name="email" 
            type="email" 
            autoComplete="email" 
            required 
            placeholder="admin@studio.os" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Password
        </label>
        <div className="mt-1">
          <Input 
            id="password" 
            name="password" 
            type="password" 
            autoComplete="current-password" 
            required 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Checkbox 
            id="remember-me" 
            name="remember-me" 
            label="Remember me" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
          />
        </div>

        <div className="text-sm">
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400">
            Forgot password?
          </a>
        </div>
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
