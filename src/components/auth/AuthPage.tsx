"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, UserPlus, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuthPageProps {
  onGuest: () => void;
  onAuthSuccess?: () => void;
}

export function AuthPage({ onGuest, onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVerifyPending, setIsVerifyPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuthSuccess?.();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (data.user && !data.session) {
          setIsVerifyPending(true);
        } else {
          onAuthSuccess?.();
        }
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-md"
      >

        {/* Glassmorphic card */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-xl p-8">

          {isVerifyPending ? (

            // --- SUCCESS SCREEN ---
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
                <Mail size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Check your inbox</h2>
              <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                We've sent a verification link to <br />
                <span className="font-semibold text-slate-800">{email}</span>. <br />
                Please click the link to activate your account.
              </p>
              <button
                onClick={() => {
                  setIsVerifyPending(false);
                  setMode("signin");
                }}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
              >
                Back to Sign In
              </button>
            </div>

          ) : (

            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Sparkles size={24} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Task Manager</h1>
                <p className="text-sm text-slate-500 mt-1">
                  {mode === "signin"
                    ? "Welcome back! Sign in to continue."
                    : "Create an account to get started."}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* ... (Keep your exact existing form code here) ... */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all" />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all" />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white font-medium text-sm rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {mode === "signin" ? (
                    <>
                      <LogIn size={16} />
                      {loading ? "Signing in..." : "Sign In"}
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      {loading ? "Creating..." : "Create Account"}
                    </>
                  )}
                </button>
              </form>

              {/* Mode toggle */}
              <div className="text-center mt-5 text-sm text-slate-500">
                {mode === "signin" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button type="button" onClick={() => { setMode("signup"); setError(null); }} className="text-indigo-600 font-medium hover:underline">Sign Up</button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button type="button" onClick={() => { setMode("signin"); setError(null); }} className="text-indigo-600 font-medium hover:underline">Sign In</button>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Guest button */}
              <button type="button" onClick={onGuest} className="w-full py-2.5 border-2 border-dashed border-slate-300 text-slate-600 font-medium text-sm rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all">
                Try as Guest
              </button>
            </>
          )}
        </div>


      </motion.div>
    </div>
  );
}
