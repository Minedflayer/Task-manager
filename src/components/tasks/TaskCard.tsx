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

  const handleToggle = () => {
    // 💥 The Magic: Direct mutation updates global state and triggers 
    // only the necessary micro-renders automatically.
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

      {/* ... Rest of your render logic remains identical ... */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className={`text-slate-800 font-medium transition-all truncate ${isDone ? "line-through text-slate-400" : ""}`}>
          {task.title}
        </span>
        {/* ... Date/Time rendering ... */}
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

export const TaskCard = observer(function TaskCard({ task$ }: TaskCardProps) {
  // Use .peek() for Dnd-kit initialization so it doesn't cause reactivity loops
  const id = task$.id.peek();
  const taskData = task$.peek();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: { task: taskData },
  });

  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      layout
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
      style={dragStyle}
    >
      <div {...listeners} {...attributes} className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none">
        <GripVertical size={16} />
      </div>

      <TaskCardBody task$={task$} />
    </motion.div>
  );
});
