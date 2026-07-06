"use client";

import { useState } from 'react'; // Removed useEffect
import { observer } from '@legendapp/state/react';
import { state$, globalUser$ } from '@/lib/state/store'; // Added globalUser$
import { Home, List, Trash2, LogIn, LogOut, Menu, X } from 'lucide-react';
import { CreateCategory } from '../categories/CreateCategory';
import { supabase } from '@/lib/supabase';

export const Sidebar = observer(function Sidebar() {
  const categories = state$.categories.get();

  // Read the user directly from the global store
  const user = globalUser$.get();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleExitGuest = () => {
    localStorage.removeItem("task-manager-guest");
    window.dispatchEvent(new Event("guest-state-change"));
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut();
    }
  };

  return (
    <>
      {/* Mobile Top Nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 flex items-center justify-between px-4">
        <span className="font-semibold text-slate-800">Task Manager</span>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/95 lg:bg-white/60 backdrop-blur-xl border-r border-slate-200 h-[100dvh] lg:h-screen p-4 flex flex-col gap-6 transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Close button for mobile */}
        <div className="lg:hidden flex justify-end -mt-2 -mr-2 -mb-2">
          <button onClick={() => setIsMobileOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Replaced the loading ternary operator. Just check if user exists. */}
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
                className="flex items-center gap-3 px-2 py-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors text-sm text-slate-600 font-medium"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
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
    </>
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