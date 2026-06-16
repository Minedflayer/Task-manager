"use client";

import { useState } from "react"; // <-- 1. Import useState
import { observer, useSelector } from "@legendapp/state/react";
import { state$ } from "@/lib/state/store";
import { TaskCard } from "./TaskCard";
import { AnimatePresence } from "framer-motion";
import { TaskDetailsModal } from "./TaskDetailsModal"; // <-- 2. Import the modal

export const TaskList = observer(function TaskList() {
  // 1. Isolate sorting logic
  // This derived state strictly returns an array of string IDs.

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const sortedTaskIds = useSelector(() => {
    const tasks = state$.tasks.get();


    // Create a shallow copy to sort by date chronologically
    return [...tasks]
      .filter(task => task.status !== 'done')
      .sort((a, b) => {
        // Sort chronologically by scheduled_date
        const dateA = a.scheduled_date ? new Date(a.scheduled_date).getTime() : Infinity;
        const dateB = b.scheduled_date ? new Date(b.scheduled_date).getTime() : Infinity;

        return dateA - dateB;
      })
      .map(task => task.id);
  });

  return (
    <>
      {/* 4. Wrap the return in a fragment so you can render the list AND the modal */}
      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {sortedTaskIds.map((id) => {
            const task$ = state$.tasks.find(t => t.id.peek() === id);

            if (!task$) return null;

            return (
              <TaskCard
                key={id}
                task$={task$}
                onTaskClick={(taskId) => {
                  console.log("TaskCard clicked! ID:", taskId); // <-- The debug log
                  setSelectedTaskId(taskId);
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* 5. Render the modal and pass the state and a close handler */}
      <TaskDetailsModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </>
  );
});
