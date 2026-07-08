"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { observer } from "@legendapp/state/react";
import { X, Clock, Plus } from "lucide-react";
import { state$ } from "@/lib/state/store";

// Make sure to import the custom dropdowns we built earlier!
import { CategoryDropdown } from "../tasks/CategoryDropDown";
import { DatePickerDropdown } from "../tasks/DatePickerDropdown";
import { generateId } from "@/utils/generateId";

interface CreateTaskModalProps {
    date: string;
    hour: string;
    onClose: () => void;
}

// 1. Wrapped in observer() because we are reading state$.categories
export const CreateTaskModal = observer(function CreateTaskModal({ date, hour, onClose }: CreateTaskModalProps) {
    const [mounted, setMounted] = useState(false);

    // 2. Form State: Notice how date and hour are used as the initial values!
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [scheduledDate, setScheduledDate] = useState(date);
    const [scheduledTime, setScheduledTime] = useState(hour);

    const categories = state$.categories.get();

    useEffect(() => setMounted(true), []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        // 3. Exact same logic from your CreateTask component
        state$.tasks.push({
            id: generateId(),
            title: title.trim(),
            status: 'pending',
            category_id: categoryId || null,
            scheduled_date: scheduledDate || null,
            scheduled_time: scheduledTime || null,
            recurrence_end_date: null
        });

        // 4. Close the modal after successful creation
        onClose();
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/20"
                onClick={onClose}
            />

            <div className="relative bg-white/90 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 z-10 animate-in fade-in zoom-in-95 duration-200">

                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-slate-800">New Task</h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 5. The Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="What needs to be done?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus // Automatically focus the input when modal opens
                        className="w-full text-lg font-medium bg-transparent border-none focus:ring-0 focus:outline-none placeholder:text-slate-400 px-1"
                    />

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        {/* Custom Category Dropdown */}
                        <CategoryDropdown
                            // categories={categories}
                            selectedId={categoryId}
                            onChange={setCategoryId}
                        />

                        {/* Custom Date Dropdown */}
                        <DatePickerDropdown
                            selectedDate={scheduledDate}
                            onChange={setScheduledDate}
                        />

                        {/* Native Time Picker */}
                        <div className="relative flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-600 cursor-pointer hover:bg-slate-200 transition-colors">
                            <Clock size={14} className="text-slate-400 z-0" />
                            <input
                                type="time"
                                aria-label="Time"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 focus:outline-none text-slate-600 cursor-pointer z-10
                     [&::-webkit-calendar-picker-indicator]:absolute 
                     [&::-webkit-calendar-picker-indicator]:inset-0 
                     [&::-webkit-calendar-picker-indicator]:w-full 
                     [&::-webkit-calendar-picker-indicator]:h-full 
                     [&::-webkit-calendar-picker-indicator]:opacity-0 
                     [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-medium text-sm rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} />
                            Save Task
                        </button>
                    </div>
                </form>

            </div>
        </div>,
        document.body
    );
});