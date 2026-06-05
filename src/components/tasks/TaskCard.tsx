"use client";

import { useObservable, observer } from "@legendapp/state/react";
import { motion } from "framer-motion";
import { Check, Calendar as CalendarIcon, Clock } from "lucide-react";
import { state$, Task } from "@/lib/state/store";

interface TaskCardProps {
  task: Task;
}

export const TaskCard = observer(function TaskCard({ task }: TaskCardProps) {
  // Use local observable for smooth micro-interactions
  const isDone = useObservable(task.status === "done");

  const category = task.category_id 
    ? state$.categories.get().find(c => c.id === task.category_id)
    : null;

  const handleToggle = () => {
    const newValue = !isDone.get();
    isDone.set(newValue);
    
    // Update global state
    const taskIndex = state$.tasks.get().findIndex((t: Task) => t.id === task.id);
    if (taskIndex !== -1) {
      state$.tasks[taskIndex].status.set(newValue ? "done" : "pending");
    }
  };

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleToggle}
    >
      <button
        type="button"
        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 ${
          isDone.get()
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        {isDone.get() && <Check size={14} className="stroke-[3]" />}
      </button>
      
      <div className="flex flex-col flex-1">
        <span
          className={`text-slate-800 font-medium transition-all ${
            isDone.get() ? "line-through text-slate-400" : ""
          }`}
        >
          {task.title}
        </span>
        
        {(task.scheduled_date || task.scheduled_time) && (
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            {task.scheduled_date && (
              <span className="flex items-center gap-1">
                <CalendarIcon size={12} /> {task.scheduled_date}
              </span>
            )}
            {task.scheduled_time && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {task.scheduled_time}
              </span>
            )}
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
    </motion.div>
  );
});
