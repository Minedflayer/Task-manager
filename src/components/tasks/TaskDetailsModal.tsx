"use client";
import { useState, useEffect } from 'react';
import { observer } from '@legendapp/state/react';
import { state$ } from '@/lib/state/store';
import { Dialog } from '@headlessui/react';
// ... icon imports

interface TaskDetailsModalProps {
    taskId: string | null;
    onClose: () => void;

}

export const TaskDetailsModal = observer(function TaskDetailsModal({ taskId, onClose }: TaskDetailsModalProps) {
    // 1. Local Draft State
    const [draftTitle, setDraftTitle] = useState('');
    const [draftDescription, setDraftDescription] = useState('');
    // ... other draft states

    // Load data modal opens
    useEffect(() => {
        // Find task in the store
        if (taskId) {
            const task = state$.tasks.get().find(t => t.id === taskId);
            // Copy global data to the draft state
            if (task) {
                setDraftTitle(task.title || '');
                setDraftDescription(task.description || '');
            }

        }
    }, [taskId]);

    if (!taskId) return null;

    // Action functions

    const handleSave = () => {
        const tasks = state$.tasks.peek(); // Get the stored tasks
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex >= 0) {
            const currentTask = state$.tasks[taskIndex].peek();
            // Commit changes to Legend-State
            // 3. Overwrite it with the new values using standard spread syntax
            state$.tasks[taskIndex].set({
                ...currentTask,
                title: draftTitle,
                description: draftDescription,
                updated_at: new Date().toISOString()
            });
        }
        onClose();

    }

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

    return (
        <Dialog open={!!taskId} onClose={onClose}>
            {/* Build your UI here matching the uploaded image!
            - Use draftTitle in your input fields
            - Bind handleSave, handleDelete, and handleMarkCompleted to your buttons
            */}
        </Dialog>
    );

});