"use client";

import { useState } from "react";
import { Activity, Eye, EyeOff, Lock, Mail, ArrowRight, Heart } from "lucide-react";
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
      {/* Left: Textured decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#faf8f9] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* SVG texture layer */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          {/* Large arc - top right */}
          <circle cx="85%" cy="-10%" r="55%" fill="none" stroke="#e8d5de" strokeWidth="1" />
          <circle cx="85%" cy="-10%" r="48%" fill="none" stroke="#f0e0e8" strokeWidth="0.5" />
          {/* Large arc - bottom left */}
          <circle cx="-5%" cy="110%" r="60%" fill="none" stroke="#e8d5de" strokeWidth="1" />
          <circle cx="-5%" cy="110%" r="52%" fill="none" stroke="#f0e0e8" strokeWidth="0.5" />
          {/* Accent horizontal line with pulse shape */}
          <line x1="0" y1="50%" x2="38%" y2="50%" stroke="#d6336c" strokeWidth="2.5" strokeOpacity="0.35" />
          <polyline points="190,50% 200,48% 210,54% 218,46% 226,56% 234,48% 244,50%" stroke="#d6336c" strokeWidth="2.5" strokeOpacity="0.35" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(0)' }} />
          {/* Halftone dot grid - top right */}
          {Array.from({ length: 8 }).map((_, row) =>
            Array.from({ length: 8 }).map((_, col) => (
              <circle
                key={`dot-tr-${row}-${col}`}
                cx={`${78 + col * 2.5}%`}
                cy={`${8 + row * 2.5}%`}
                r={Math.max(1, 3.5 - (row + col) * 0.3)}
                fill="#d6336c"
                fillOpacity={Math.max(0.04, 0.2 - (row + col) * 0.02)}
              />
            ))
          )}
          {/* Halftone dot grid - bottom left */}
          {Array.from({ length: 6 }).map((_, row) =>
            Array.from({ length: 6 }).map((_, col) => (
              <circle
                key={`dot-bl-${row}-${col}`}
                cx={`${6 + col * 2.5}%`}
                cy={`${72 + row * 2.5}%`}
                r={Math.max(1, 3 - (row + col) * 0.3)}
                fill="#d6336c"
                fillOpacity={Math.max(0.03, 0.15 - (row + col) * 0.015)}
              />
            ))
          )}
          {/* Small accent circle */}
          <circle cx="28%" cy="22%" r="18" fill="none" stroke="#d6336c" strokeWidth="1.5" strokeOpacity="0.2" />
          <circle cx="72%" cy="78%" r="12" fill="#d6336c" fillOpacity="0.08" />
        </svg>

        {/* Heartbeat SVG line across center (rendered separately for precise control) */}
        <svg className="absolute left-0 w-full" style={{ top: '50%', transform: 'translateY(-50%)' }} height="40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            d="M0,20 L180,20 L195,20 L205,6 L215,34 L225,8 L235,30 L245,14 L255,20 L1200,20"
            stroke="#d6336c"
            strokeWidth="2.5"
            strokeOpacity="0.3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-magenta-600 text-white shadow-lg shadow-magenta-200/50">
            <Activity size={40} />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">
              CareLink <span className="text-magenta-600">Doctor</span>
            </h1>
            <p className="text-gray-500 max-w-xs text-sm">
              Remote patient monitoring for better care
            </p>
          </div>
        </div>

        {/* T-Mobile co-branding */}
        <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-2">
          <span className="text-[10px] font-medium tracking-widest text-gray-400 uppercase">Powered by</span>
          <img src="/tmobile-logo.png" alt="T-Mobile" className="h-6 object-contain" />
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-magenta-600 text-white">
              <Activity size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">
              CareLink <span className="text-magenta-600">Doctor</span>
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Email</label>
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
              <label className="block text-sm font-medium text-gray-700">Password</label>
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

          <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-center">
            <p className="text-xs text-gray-500">
              Demo: <span className="font-mono font-medium text-gray-700">sarah.chen@carelink.health</span> / <span className="font-mono font-medium text-gray-700">carelink2025</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
