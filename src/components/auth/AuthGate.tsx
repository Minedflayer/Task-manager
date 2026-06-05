"use client";

import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthPage } from "@/components/auth/AuthPage";

interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * Wraps the app content. Shows the AuthPage if not authenticated and not in guest mode.
 * Passes auth state down via context or props as needed.
 */
export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user was previously a guest
    const guestFlag = typeof window !== "undefined" && localStorage.getItem("task-manager-guest");
    if (guestFlag === "true") {
      setIsGuest(true);
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    let currentChannel: any = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // If they were a guest, migrate their data
          const guestFlag = localStorage.getItem("task-manager-guest");
          if (guestFlag === "true") {
            try {
              const { migrateToSupabase } = await import("@/lib/sync/syncUtils");
              await migrateToSupabase(session.user.id);
            } catch (err) {
              console.error("Migration failed:", err);
            }
          }
          // Clear guest flag when user signs in
          localStorage.removeItem("task-manager-guest");
          setIsGuest(false);

          // Setup realtime sync
          if (!currentChannel) {
            import("@/lib/sync/realtime").then(({ setupRealtimeSync }) => {
              currentChannel = setupRealtimeSync(session.user.id);
            });
          }
        } else {
          // Cleanup channel if user logs out
          if (currentChannel) {
            supabase.removeChannel(currentChannel);
            currentChannel = null;
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (currentChannel) {
        supabase.removeChannel(currentChannel);
      }
    };
  }, []);

  const handleGuest = () => {
    localStorage.setItem("task-manager-guest", "true");
    setIsGuest(true);
  };

  const handleAuthSuccess = () => {
    // Auth state change listener will handle the rest
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && !isGuest) {
    return <AuthPage onGuest={handleGuest} onAuthSuccess={handleAuthSuccess} />;
  }

  return <>{children}</>;
}
