"use client";

import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthPage } from "@/components/auth/AuthPage";
import { setupRealtimeSync } from "@/lib/sync/realtime";
import { fetchInitialData } from '@/lib/sync/realtime';

interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * Wraps the app content. Shows the AuthPage if not authenticated and not in guest mode.
 * Passes auth state down via context or props as needed.
 */
export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("task-manager-guest") === "true";
    }
    return false;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      //setLoading(false);
    })
      .catch((err) => {
        console.error("Session check failed: ", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for guest state changes (e.g. from the sidebar exit guest action)
    const handleGuestChange = () => {
      const guestFlag = localStorage.getItem("task-manager-guest");
      setIsGuest(guestFlag === "true");
    };
    window.addEventListener("guest-state-change", handleGuestChange);

    // Listen for auth changes
    let cleanupSync: (() => void) | null = null;

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
          window.dispatchEvent(new Event("guest-state-change"));

          try {
            await fetchInitialData(session.user.id);
          } catch (err) {
            console.error("Failed to fetch");
          }

          // Setup realtime sync
          if (!cleanupSync) {
            cleanupSync = setupRealtimeSync(session.user.id);
          }
        } else {
          // Cleanup channel if user logs out
          if (cleanupSync) {
            cleanupSync();
            cleanupSync = null;
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("guest-state-change", handleGuestChange);
      if (cleanupSync) {
        cleanupSync();
      }
    };
  }, []);

  const handleGuest = () => {
    localStorage.setItem("task-manager-guest", "true");
    setIsGuest(true);
    window.dispatchEvent(new Event("guest-state-change"));
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
