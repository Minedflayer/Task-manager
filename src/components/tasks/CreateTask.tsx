"use client";

import { useState } from 'react';
import { useObservable, observer } from '@legendapp/state/react';
import { state$ } from '@/lib/state/store';
import { Plus, Calendar, Clock, Tag } from 'lucide-react';
import { CategoryDropdown } from './CategoryDropDown';
import { DatePickerDropdown } from './DatePickerDropdown';
import { TimePickerDropdown } from './TimePickerDropdown';

export const CreateTask = observer(function CreateTask() {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const categories = state$.categories.get();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    state$.tasks.push({
      id: crypto.randomUUID(),
      title: title.trim(),
      status: 'pending',
      category_id: categoryId || null,
      scheduled_date: scheduledDate || null,
      scheduled_time: scheduledTime || null,
    });

    // Reset form
    setTitle('');
    setCategoryId('');
    setScheduledDate('');
    setScheduledTime('');
  };

  return (
    <div className="relative z-30 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-sm p-4 mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-lg font-medium bg-transparent border-none focus:ring-0 focus:outline-none placeholder:text-slate-400"
        />

        <div className="flex flex-wrap items-center gap-3 mt-2">
          {/* Category - Replaced native select with our custom component */}
          <CategoryDropdown
            categories={categories}
            selectedId={categoryId}
            onChange={setCategoryId}
          />


          <DatePickerDropdown
            selectedDate={scheduledDate}
            onChange={setScheduledDate}
          />

          {/* Time (Fixed Click Zone) */}
          <TimePickerDropdown
            selectedTime={scheduledTime}
            onChange={setScheduledTime}
          />


          <button
            type="submit"
            disabled={!title.trim()}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-medium text-sm rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
});
