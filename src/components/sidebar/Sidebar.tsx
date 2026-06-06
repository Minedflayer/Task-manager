"use client";

import { observer } from '@legendapp/state/react';
import { state$ } from '@/lib/state/store';
import { Home, List, Folder, Tag, Users, Trash2 } from 'lucide-react';
import { CreateCategory } from '../categories/CreateCategory';

export const Sidebar = observer(function Sidebar() {
  const categories = state$.categories.get();

  return (
    <aside className="w-64 bg-white/60 backdrop-blur-xl border-r border-slate-200 h-screen p-4 flex flex-col gap-6">
      <div className="flex items-center gap-3 px-2 py-3 bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-medium">
          U
        </div>
        <span className="font-medium text-slate-800">User</span>
      </div>

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
