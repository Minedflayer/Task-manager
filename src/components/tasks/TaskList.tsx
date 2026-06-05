"use client";

import { observer } from "@legendapp/state/react";
import { state$ } from "@/lib/state/store";
import { TaskCard } from "./TaskCard";

export const TaskList = observer(function TaskList() {
  const tasks = state$.tasks.get();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500">
        No tasks yet. Create one above!
      </div>
    );
  }

  // Sort tasks: pending first, then by creation (implicitly by array order for now)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-3">
      {sortedTasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
});
