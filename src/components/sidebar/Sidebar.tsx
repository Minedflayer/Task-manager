"use client";

import { useState, useEffect } from 'react';
import { observer } from '@legendapp/state/react';
import { globalUser$, state$ } from '@/lib/state/store';
import { Home, List, Trash2, LogIn, LogOut } from 'lucide-react';
import { CreateCategory } from '../categories/CreateCategory';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export const Sidebar = observer(function Sidebar() {
  const categories = state$.categories.get();


  // Instantly read the user from memory. No loading, no fetching!
  const user = globalUser$.get();

  // useEffect(() => {
  //   let isMounted = true;


  //   const fallbackTimeout = setTimeout(() => {
  //     if (isMounted) setLoading(false);
  //   }, 1500);

  //   // Fetch initial session safely
  //   supabase.auth.getSession()
  //     .then(({ data: { session } }) => {
  //       if (isMounted) setUser(session?.user ?? null);
  //     })
  //     .catch(err => console.error("Sidebar session error:", err))
  //     .finally(() => {
  //       if (isMounted) {
  //         setLoading(false);
  //         clearTimeout(fallbackTimeout);
  //       }
  //     });

  //   // Listen for auth changes
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  //     if (isMounted) setUser(session?.user ?? null);
  //   });

  //   return () => {
  //     isMounted = false;
  //     clearTimeout(fallbackTimeout);
  //     subscription.unsubscribe();
  //   };
  // }, []);

  const handleExitGuest = () => {
    localStorage.removeItem("task-manager-guest");
    window.dispatchEvent(new Event("guest-state-change"));
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await supabase.auth.signOut()

      } catch (error) {
        console.log("Supabase signout failed, forcing local logout:", error);
      } finally {
        state$.tasks.set([]);
        state$.categories.set([]);
        globalUser$.set(null);

        window.location.reload();
      };
    }
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    if (confirm(`Are you sure you want to delete the "${categoryName}" category?`)) {
      // Remove category from global state
      const currentCategories = state$.categories.get();
      state$.categories.set(currentCategories.filter(c => c.id !== categoryId));

      // Clean up
      const tasks = state$.tasks.peek();
      const now = new Date().toISOString;

      tasks.forEach((task, index) => {
        if (task.category_id === categoryId) {
          state$.tasks[index].category_id.set(null);
          state$.tasks[index].updated_at.set(now);
        }

      });

    }
  }

  return (
    <aside className="w-64 bg-white/60 backdrop-blur-xl border-r border-slate-200 h-screen p-4 flex flex-col gap-6">
      {user ? (
        <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold shadow-md shadow-orange-100 text-sm">
              {user.email?.[0].toUpperCase() ?? 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-slate-800 text-sm leading-none truncate" title={user.email ?? ''}>
                {user.email?.split('@')[0]}
              </span>
              <span className="text-[10px] text-slate-500 truncate mt-1 leading-none" title={user.email ?? ''}>
                {user.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="mt-1 w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-white hover:bg-red-50 border border-slate-200 text-slate-600 hover:text-red-600 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <LogOut size={13} className="text-slate-400" />
            <span>Sign Out</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-3 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100/40 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md shadow-indigo-100 text-sm">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800 text-sm leading-none">Guest User</span>
              <span className="text-[10px] text-indigo-600 font-medium mt-1 leading-none bg-indigo-50 px-1.5 py-0.5 rounded-full w-max">Guest Mode</span>
            </div>
          </div>

          <button
            onClick={handleExitGuest}
            className="mt-1 w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <LogIn size={13} className="text-indigo-500 animate-pulse" />
            <span>Sign In / Sign Up</span>
          </button>
        </div>
      )}

      <nav className="flex flex-col gap-1">
        <SidebarItem icon={<Home size={18} />} label="Home" />
        <SidebarItem icon={<List size={18} />} label="Tasks" />
      </nav>

      <div className="mt-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
          Categories
        </div>
        <div className="flex flex-col gap-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group flex items-center justify-between px-2 py-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors text-sm text-slate-600 font-medium"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(cat.id, cat.name);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-all"
                title="Delete Category"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <CreateCategory />
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200">
        <button
          onClick={async () => {
            if (confirm('Are you sure you want to clear all tasks?')) {
              state$.tasks.set([]);
              const { supabase } = await import('@/lib/supabase');
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user) {
                await supabase.from('tasks').delete().eq('user_id', session.user.id);
              }
            }
          }}
          className="flex items-center gap-3 px-2 py-2 hover:bg-red-50 text-red-600 rounded-lg w-full text-left transition-colors font-medium text-sm"
        >
          <Trash2 size={18} />
          Clear All Tasks
        </button>
      </div>
    </aside>
  );
});

function SidebarItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-3 px-2 py-2 hover:bg-slate-100 rounded-lg w-full text-left transition-colors text-slate-600 font-medium text-sm">
      {icon}
      {label}
    </button>
  );
}
