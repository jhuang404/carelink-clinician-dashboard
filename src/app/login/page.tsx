"use client";

import { useState } from "react";
import { Activity, Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    if (!result.success) {
      setError(result.error || "Login failed");
    }
    setIsSubmitting(false);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-magenta-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-magenta-600 via-magenta-700 to-magenta-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -left-10 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-32 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Activity size={24} />
            </div>
            <span className="text-2xl font-bold">CareLink Doctor</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Remote Patient<br />Monitoring Dashboard
          </h1>
          <p className="text-lg text-magenta-100 max-w-md">
            Monitor blood pressure readings, manage alerts, and communicate with patients — all in one secure platform.
          </p>
          <div className="flex gap-8 pt-4">
            {[
              { value: "Real-time", label: "BP Monitoring" },
              { value: "Smart", label: "Alert System" },
              { value: "Secure", label: "Messaging" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xl font-bold">{item.value}</p>
                <p className="text-sm text-magenta-200">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-magenta-200">
          HIPAA Compliant &middot; End-to-End Encrypted
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-magenta-600 text-white">
              <Activity size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">
              CareLink <span className="text-magenta-600">Doctor</span>
            </span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-gray-500">Sign in to your clinician account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah.chen@carelink.health"
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm focus:border-magenta-500 focus:outline-none focus:ring-2 focus:ring-magenta-500/20 transition-colors"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-12 text-sm focus:border-magenta-500 focus:outline-none focus:ring-2 focus:ring-magenta-500/20 transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-magenta-600 focus:ring-magenta-500" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-magenta-600 hover:text-magenta-700 font-medium">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-magenta-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-magenta-700 focus:outline-none focus:ring-2 focus:ring-magenta-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="rounded-lg bg-gray-100 px-4 py-3 text-center">
            <p className="text-xs text-gray-500">
              Demo credentials: <span className="font-mono font-medium text-gray-700">sarah.chen@carelink.health</span> / <span className="font-mono font-medium text-gray-700">carelink2025</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
