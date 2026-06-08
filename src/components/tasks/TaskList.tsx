"use client";

import { observer, useSelector } from "@legendapp/state/react";
import { state$ } from "@/lib/state/store";
import { TaskCard } from "./TaskCard";
import { AnimatePresence } from "framer-motion";

export const TaskList = observer(function TaskList() {
  // 1. Isolate sorting logic
  // This derived state strictly returns an array of string IDs.
  const sortedTaskIds = useSelector(() => {
    const tasks = state$.tasks.get();


    // Create a shallow copy to sort by date chronologically
    return [...tasks]
      .filter(task => task.status === 'done')
      .sort((a, b) => {
        // Sort chronologically by scheduled_date
        const dateA = a.scheduled_date ? new Date(a.scheduled_date).getTime() : Infinity;
        const dateB = b.scheduled_date ? new Date(b.scheduled_date).getTime() : Infinity;

        return dateA - dateB;
      })
      .map(task => task.id);
  });

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {sortedTaskIds.map((id) => {
          // 2. Pass the specific observable proxy, not the raw value!
          // .find() on an observable array returns the observable node for that item.
          const task$ = state$.tasks.find(t => t.id.peek() === id);

          if (!task$) return null;

          return <TaskCard key={id} task$={task$} />;
        })}
      </AnimatePresence>
    </div>
  );
});
