"use client";
import { CategoryDropdown } from './CategoryDropDown';
import { useState, useEffect, Fragment } from 'react';
import { observer } from '@legendapp/state/react';
import { state$ } from '@/lib/state/store';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import {
    X,
    Pencil,
    Trash2,
    MoreVertical,
    AlignLeft,
    List as ListIcon,
    Calendar,
    CalendarCheck,
    Lock,
} from 'lucide-react';

interface TaskDetailsModalProps {
    taskId: string | null;
    onClose: () => void;
    isOpen: boolean;
}

export const TaskDetailsModal = observer(function TaskDetailsModal({ taskId, onClose, isOpen }: TaskDetailsModalProps) {
    const [draftTitle, setDraftTitle] = useState('');
    const [draftDescription, setDraftDescription] = useState('');
    const [draftCategoryId, setDraftCategoryId] = useState('');

    // We can fetch the task and category data to display dynamically
    const task = taskId ? state$.tasks.get().find(t => t.id === taskId) : null;
    const categories = state$.categories.get();

    // const category = task?.category_id ? categories.find(c => c.id === task.category_id) : null;
    const category = draftCategoryId ? categories.find(c => c.id === draftCategoryId) : null;

    useEffect(() => {
        // Find task in the store
        if (taskId) {
            const task = state$.tasks.get().find(t => t.id === taskId);
            // Copy global data to the draft state
            if (task) {
                setDraftTitle(task.title || '');
                setDraftDescription(task.description || '');
                setDraftCategoryId(task.category_id || '');
            }

        }
    }, [taskId]);

    // if (!taskId || !task) return null;

    const handleSave = () => {
        const tasks = state$.tasks.peek();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex >= 0) {
            const currentTask = state$.tasks[taskIndex].peek();
            state$.tasks[taskIndex].set({
                ...currentTask,
                title: draftTitle,
                description: draftDescription,
                category_id: draftCategoryId || null,
                updated_at: new Date().toISOString()
            });
        }
        onClose();
    };

    const handleDelete = () => {
        const tasks = state$.tasks.get();
        state$.tasks.set(tasks.filter(t => t.id !== taskId));
        onClose();
    };

    const handleMarkCompleted = () => {
        const tasks = state$.tasks.get();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex >= 0) {
            state$.tasks[taskIndex].status.set('done');
            state$.tasks[taskIndex].updated_at.set(new Date().toISOString());
        }
        onClose();
    };

    // Helper to format the date string to match the image format
    const formattedDate = task?.scheduled_date
        ? new Date(task.scheduled_date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
        : "No date set";

    return (
        <Transition appear show={!!taskId} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <TransitionChild
                    as={Fragment}
                    enter="transition-opacity ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/20" />
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
                            <DialogPanel className="w-full max-w-[440px] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all flex flex-col">

                                {/* Top Action Bar */}
                                <div className="flex justify-end gap-1 p-3">
                                    <button onClick={handleSave} className="cursor-pointer p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors" title="Save Changes">
                                        <Pencil size={18} />
                                    </button>
                                    <button onClick={handleDelete} className="cursor-pointer p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete Task">
                                        <Trash2 size={18} />
                                    </button>
                                    <button onClick={onClose} className="cursor-pointer p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors ml-2">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Body Content */}
                                <div className="px-6 pb-6 pt-2">

                                    {/* Title & Date Row */}
                                    <div className="flex items-start gap-4 mb-6">
                                        {/* Category Color Dot */}
                                        <div
                                            className="w-4 h-4 rounded mt-2.5 flex-shrink-0"
                                            style={{ backgroundColor: category?.color || '#3b82f6' }}
                                        />

                                        <div className="flex-1 min-w-0">
                                            <input
                                                type="text"
                                                value={draftTitle}
                                                onChange={(e) => setDraftTitle(e.target.value)}
                                                className="w-full text-2xl font-normal text-slate-800 bg-transparent border-0 focus:ring-0 p-0 mb-1 placeholder:text-slate-300"
                                                placeholder="Task title"
                                            />
                                            <div className="text-sm text-slate-600">
                                                {formattedDate} {task?.scheduled_time ? `• ${task.scheduled_time}` : ''}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details List */}
                                    <div className="flex flex-col gap-4 text-slate-700">
                                        {/* Description */}
                                        <div className="flex items-start gap-4">
                                            <AlignLeft className="w-5 h-5 text-slate-500 mt-1 flex-shrink-0" />
                                            <textarea
                                                value={draftDescription}
                                                onChange={(e) => setDraftDescription(e.target.value)}
                                                placeholder="Add a description"
                                                className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm resize-none placeholder:text-slate-400"
                                                rows={2}
                                            />
                                        </div>

                                        {/* Category Link */}
                                        <div className='flex items-center gap-4 relative z-2'>
                                            <div className='-ml-2'>
                                                <CategoryDropdown
                                                    selectedId={draftCategoryId}
                                                    onChange={setDraftCategoryId}

                                                />

                                            </div>

                                        </div>

                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="bg-slate-50/80 px-6 py-3 flex justify-end gap-3 mt-auto border-t border-slate-100">
                                    <button
                                        onClick={handleSave}
                                        className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-full transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={handleMarkCompleted}
                                        className="px-5 py-2 text-sm font-medium bg-[#d3e3fd] text-[#041e49] hover:bg-[#c2d7fa] rounded-full transition-colors"
                                    >
                                        Mark completed
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
});