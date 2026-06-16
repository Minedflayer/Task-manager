// src/components/tasks/CreateTask.tsx
"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CreateTaskModal } from './CreateTaskModal';

export function CreateTask() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all mb-6 group"
      >
        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <Plus size={14} strokeWidth={3} />
        </div>
        Create new task
      </button>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}