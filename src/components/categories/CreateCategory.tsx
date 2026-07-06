"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { state$ } from '@/lib/state/store';
import { generateId } from '@/utils/generateId';

const PASTEL_COLORS = [
  '#ffb3ba', // Pink
  '#ffdfba', // Orange
  '#ffffba', // Yellow
  '#baffc9', // Green
  '#bae1ff', // Blue
  '#e8baff', // Purple
];

export function CreateCategory() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PASTEL_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    state$.categories.push({
      id: generateId(),
      name: name.trim(),
      color: selectedColor,
    });

    setIsOpen(false);
    setName('');
    setSelectedColor(PASTEL_COLORS[0]);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer flex items-center gap-2 px-2 py-2 mt-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-lg transition-colors w-full"
      >
        <Plus size={16} />
        Add Category
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-2 py-1.5 text-sm border-b border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors"
          autoFocus
        />

        <div className="flex gap-2 justify-between">
          {PASTEL_COLORS.map((color) => (
            <label key={color} className="cursor-pointer relative flex items-center justify-center">
              <input
                type="radio"
                name="categoryColor"
                value={color}
                checked={selectedColor === color}
                onChange={() => setSelectedColor(color)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full transition-transform ${selectedColor === color ? 'scale-125 ring-2 ring-offset-1 ring-slate-300' : 'hover:scale-110'
                  }`}
                style={{ backgroundColor: color }}
              />
            </label>
          ))}
        </div>

        <div className="flex gap-2 justify-end mt-1">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-3 py-1 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
