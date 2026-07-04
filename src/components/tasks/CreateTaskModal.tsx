"use client";

import React, { Fragment, useState } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { state$ } from '@/lib/state/store';
import { X, Clock, AlignLeft, Tag, Repeat } from 'lucide-react';
import { DatePickerDropdown } from './DatePickerDropdown';
import { CategoryDropdown } from './CategoryDropDown';
import { TimePickerDropdown } from './TimePickerDropdown';
import { RepeatDropdown } from './RepeatDropdown';
import { generateId } from '@/utils/generateId';

import { DurationDropdown, DurationMode } from './DurationDropdown';


interface CreateTaskModalProps {
    isOpen: boolean
    onClose: () => void;
    initialDate?: string;
    initialTime?: string;
}

export function CreateTaskModal({ isOpen, onClose, initialDate = '', initialTime = '' }: CreateTaskModalProps) {
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [description, setDescription] = useState('');

    const [repeatMode, setRepeatMode] = useState<'none' | 'daily'>('none');
    const [durationMode, setDurationMode] = useState<DurationMode>('7_days');
    const [customEndDate, setCustomEndDate] = useState('');

    const categories = state$.categories.get();

    const resetForm = () => {
        setTitle('');
        setCategoryId('');
        setScheduledDate('');
        setStartTime('');
        setDescription('');
        setRepeatMode('none');
        setDurationMode('7_days'); // Reset to default
        setCustomEndDate('');      // Clear custom date
    };

    const handleClose = () => {
        resetForm();
        onClose();
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) return;

        // Calculate the recurrence end date
        let finalRecurrenceEndDate = null

        if (repeatMode === "daily") {
            if (durationMode === 'custom') {
                finalRecurrenceEndDate = null;
            } else {
                // Determine base date (use scheduledDate or fallback to today)
                const baseDate = scheduledDate ? new Date(scheduledDate) : new Date();
                const daysToAdd = durationMode === '7_days' ? 6 : 29;

                baseDate.setDate(baseDate.getDate() + daysToAdd);
                finalRecurrenceEndDate = baseDate.toISOString().split('T')[0]; // format as YYYY-MM-DD
            }

        }
        state$.tasks.push({
            id: generateId(),
            title: title.trim(),
            status: 'pending',
            category_id: categoryId || null,
            scheduled_date: scheduledDate || null,
            scheduled_time: startTime || null, // Mapping start time to your existing field
            description: description.trim() || null, // Requires DB/Store update
            recurrence: repeatMode === 'none' ? null : repeatMode, // Added recurrence field
            recurrence_end_date: finalRecurrenceEndDate,
        });

        handleClose();

    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                {/* Backdrop */}
                <TransitionChild
                    as={Fragment}
                    enter="transition-opacity ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40" />
                </TransitionChild>

                {/* Modal Positioner */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="transition-all ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="transition-all ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                        >
                            <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-slate-100">
                                {/* Header / Close Button */}
                                <div className="flex justify-end mb-2">
                                    <button
                                        onClick={handleClose}
                                        className="cursor-pointer p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    {/* Title Input */}
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Add title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full text-2xl font-medium text-slate-800 bg-transparent border-0 border-b-2 border-transparent hover:border-slate-100 focus:border-indigo-500 focus:ring-0 px-0 py-2 transition-colors placeholder:text-slate-400"

                                        />
                                    </div>

                                    {/* Date & Time Row */}
                                    <div className="relative z-30">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Clock size={18} className="text-slate-400" />
                                            <div className="flex flex-wrap items-center gap-2">
                                                <DatePickerDropdown selectedDate={scheduledDate} onChange={setScheduledDate} />
                                                <TimePickerDropdown selectedTime={startTime} onChange={setStartTime} />
                                                <span className="text-slate-400 font-medium">-</span>
                                                <TimePickerDropdown selectedTime={endTime} onChange={setEndTime} />
                                            </div>
                                        </div>

                                    </div>


                                    {/* Category Row */}
                                    <div className="flex items-center gap-3 text-slate-600 relative z-10">
                                        <Tag size={18} className="text-slate-400" />
                                        <CategoryDropdown selectedId={categoryId} onChange={setCategoryId} />
                                    </div>

                                    {/* Repeat Row */}
                                    <div className="flex items-center gap-3 text-slate-600 relative z-10 mt-1">
                                        <Repeat size={18} className="text-slate-400" />
                                        <RepeatDropdown
                                            value={repeatMode}
                                            // Accept the wide string from the dropdown, and explicitly tell TS it's safe to set
                                            onChange={(val) => setRepeatMode(val as 'none' | 'daily')}
                                        />

                                        {repeatMode === 'daily' && (
                                            <>
                                                <DurationDropdown
                                                    value={durationMode}
                                                    onChange={setDurationMode}

                                                />

                                                {durationMode === 'custom' && (
                                                    <DatePickerDropdown
                                                        selectedDate={customEndDate}
                                                        onChange={setCustomEndDate}

                                                    />
                                                )}

                                            </>
                                        )}
                                    </div>

                                    {/* Description Row (Visual Only for now) */}
                                    <div className="flex items-start gap-3 text-slate-600 mt-2">
                                        <AlignLeft size={18} className="text-slate-400 mt-2" />
                                        <textarea
                                            placeholder="Add description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all resize-none"
                                        />
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!title.trim()}
                                            className="cursor-pointer px-6 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200"
                                        >
                                            Save Task
                                        </button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );

};