"use client";

import { observer, useSelector } from "@legendapp/state/react";
import type { ObservableObject } from "@legendapp/state";
import { motion } from "framer-motion";
import { Check, Calendar as CalendarIcon, Clock, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { state$, Task } from "@/lib/state/store";

interface TaskCardProps {
  task$: ObservableObject<Task>;
  onTaskClick?: (taskId: string) => void;
}

export const TaskCardBody = observer(function TaskCardBody({ task$ }: TaskCardProps) {
  // .get() subscribes this component directly to this specific task's properties
  const task = task$.get();
  const isDone = task.status === "done";

  // Use useSelector so unrelated category updates don't re-render this card
  const category = useSelector(() =>
    task.category_id
      ? state$.categories.find(c => c.id.peek() === task.category_id)?.get()
      : null
  );

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Direct mutation updates global state and triggers
    // only the necessary micro-renders automatically.
    e.stopPropagation(); // stops the modal from opening when checking the circle
    task$.status.set(isDone ? "pending" : "done");
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 ${isDone ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-slate-400"
          }`}
      >
        {isDone && <Check size={14} className="stroke-[3]" />}
      </button>

      <div className="flex flex-col flex-1 min-w-0">
        <span className={`text-slate-800 font-medium transition-all truncate ${isDone ? "line-through text-slate-400" : ""}`}>
          {task.title}
        </span>

        {task.scheduled_date && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${isDone ? "text-slate-400" : "text-slate-500"}`}>
            <CalendarIcon size={12} />
            <span>{new Date(task.scheduled_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

        )}

      </div>

      {category && (
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: category.color }}
          title={category.name}

        />
      )}

    </>
  );
});

export const TaskCard = observer(function TaskCard({ task$, onTaskClick }: TaskCardProps) {
  const id = task$.id.peek();
  const taskData = task$.peek();

  const { setNodeRef } = useDraggable({
    id: id,
    data: { task: taskData },
  });

  return (
    <motion.div
      ref={setNodeRef}
      layout
      //  An entrance animation for new tasks
      onClick={() => onTaskClick && onTaskClick(id)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}

      // The delayed exit animation
      exit={{
        opacity: 0,
        scale: 0.95,
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 0,
        marginBottom: 0,
        transition: {
          delay: 1.5,
          duration: 0.3
        }
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      // Added `overflow-hidden` so inner text doesn't spill out while height shrinks to 0
      className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
    >

      <TaskCardBody task$={task$} />
    </motion.div>
  );
});
