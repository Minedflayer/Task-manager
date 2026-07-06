"use client";

import { observer, useSelector } from "@legendapp/state/react";
import type { ObservableObject } from "@legendapp/state";
import { motion } from "framer-motion";
import { Check, Calendar as CalendarIcon, Clock, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { state$, Task } from "@/lib/state/store";
import { useState } from "react";

interface TaskCardProps {
  task$: ObservableObject<Task>;
  onTaskClick?: (taskId: string) => void;
}

/**
 * @description Renders the body of a task card.
 * @param {ObservableObject<Task>} task$ - The observable state of the task.
 * @param {(taskId: string) => void} onTaskClick - Callback function to handle task click.
 * @returns {JSX.Element} The task card body.
 */
export const TaskCardBody = observer(function TaskCardBody({ task$, onTaskClick }: TaskCardProps) {
  // .get() subscribes this component directly to this specific task's properties
  const task = task$.get();
  const isDone = task.status === "done";
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use useSelector so unrelated category updates don't re-render this card
  const category = useSelector(() =>
    task.category_id
      ? state$.categories.find(c => c.id.peek() === task.category_id)?.get()
      : null
  );

  // Pass the mouse event and stop propagation
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    task$.status.set(isDone ? "pending" : "done");
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        // className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 ${isDone ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-slate-400"
        //   }`}
        className="relative flex items-center justify-center w-6 h-6 flex-shrink-0 focus:outline-none"
      >
        {/* {isDone && <Check size={14} className="stroke-[3]" />} */}
        <motion.svg
          viewBox="0 0 24 24 "
          fill="none"
          className="absolute inset-0 w-full h-full text-cyan-400"
        >
          {/* Initial Square Box in the animation */}
          <motion.rect
            x="3" y="3" width="18" height="18" rx="4"
            stroke="currentColor"
            strokeWidth="2.5"
            initial={false}
            animate={{
              opacity: isDone ? 0 : 1,
              scale: isDone ? 0.5 : 1,
            }}
            transition={{ duration: 0.2 }}
          />

          {/* The dashed circle */}
          <motion.circle
            cx="12" cy="12" r="8"
            stroke="2.5"
            strokeWidth="4.4"
            strokeDasharray="4 4"
            initial={false}
            animate={{
              opacity: isDone ? [0, 1, 0] : 0,
              scale: isDone ? [0.8, 1.2, 1.5] : 0.5,
              rotate: isDone ? [0, 90] : 0
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />

          {/** The final checkmark */}
          <motion.path
            d="M6 12l4 4L19 7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{
              pathLength: isDone ? 1 : 0,
              opacity: isDone ? 1 : 0
            }}
            transition={{ duration: 0.3, delay: isDone ? 0.2 : 0, ease: "easeOut" }}
          />
        </motion.svg>
      </button>

      <div className="relative flex flex-col flex-1 min-w-0 ml-1">
        <div className="flex flex-col flex-1 min-w-0">
          {/* Animated Text Color Fading */}
          <motion.span
            animate={{
              color: isDone ? "#94a3b8" : "#1e293b",
              opacity: isDone ? 0.6 : 1
            }}
            transition={{ duration: 0.3 }}
            className="block truncate font-medium text-slate-800 relative z-10"
          >
            {task.title}
          </motion.span>

          {/* Animated Strikethrough Line */}
          <motion.div
            className="absolute left-0 top-1/2 h-[2px] bg-cyan-400 z-20"
            initial={false}
            animate={{ width: isDone ? "100%" : "0%" }}
            transition={{ duration: 0.3, ease: "easeOut", delay: isDone ? 0.1 : 0 }}
            style={{ originX: 0, y: "-50%", marginTop: "1px" }}
          />
        </div>

        {task.scheduled_date && (
          <motion.div
            animate={{ opacity: isDone ? 0.5 : 1 }}
            className="flex items-center gap-1 text-xs mt-1 text-slate-500"
          >
            <CalendarIcon size={12} />
            <span>{new Date(task.scheduled_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </motion.div>
        )}
      </div>

      {category && (
        <motion.div
          animate={{ opacity: isDone ? 0.3 : 1 }}
          className="w-3 h-3 rounded-full flex-shrink-0 ml-2"
          style={{ backgroundColor: category.color }}
          title={category.name}
        />
      )}

    </>
  );
});

/**
 * @description Renders a draggable task card.
 * @param {ObservableObject<Task>} task$ - The observable state of the task.
 * @param {(taskId: string) => void} onTaskClick - Callback function to handle task click.
 * @returns {JSX.Element} The draggable task card.
 */
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
      onClick={() => onTaskClick?.(id)}
      className="cursor-pointer flex items-center gap-3 p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow overflow-hidden"
    >
      <TaskCardBody task$={task$} />
    </motion.div>
  );
});
