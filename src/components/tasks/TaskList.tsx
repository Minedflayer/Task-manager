"use client";

import { observer, useSelector } from "@legendapp/state/react";
import { state$ } from "@/lib/state/store";
import { TaskCard } from "./TaskCard";

export const TaskList = observer(function TaskList() {
  // 1. Isolate sorting logic
  // This derived state strictly returns an array of string IDs.
  const sortedTaskIds = useSelector(() => {
    const tasks = state$.tasks.get();

    // Create a shallow copy to sort, prioritizing pending tasks
    return [...tasks]
      .sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === "done" ? 1 : -1;
      })
      .map(task => task.id);
  });

  return (
    <div className="flex flex-col gap-3">
      {sortedTaskIds.map((id) => {
        // 2. Pass the specific observable proxy, not the raw value!
        // .find() on an observable array returns the observable node for that item.
        const task$ = state$.tasks.find(t => t.id.peek() === id);

        if (!task$) return null;

        return <TaskCard key={id} task$={task$} />;
      })}
    </div>
  );
});
