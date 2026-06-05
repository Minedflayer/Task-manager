"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { useState } from "react";
import { observer } from "@legendapp/state/react";
import { state$, Task } from "@/lib/state/store";
import { scheduleTask } from "@/lib/calendar/dndUtils";

interface DndProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the dashboard content with dnd-kit's DndContext.
 * Handles drag start (for DragOverlay) and drag end (calls scheduleTask).
 * The droppable slot IDs follow the format: "slot-{date}-{hour}" (e.g. "slot-2026-06-10-14:00").
 * The draggable task IDs are just the task IDs.
 */
export const DndProvider = observer(function DndProvider({ children }: DndProviderProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require 8px of movement before starting drag — prevents accidental drags on click
        distance: 8,
      },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const taskId = String(event.active.id);
    const task = state$.tasks.get().find((t) => t.id === taskId) ?? null;
    setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const slotId = String(over.id); // e.g. "slot-2026-06-10-14:00"

    // Parse slot ID: format is "slot-{YYYY-MM-DD}-{HH:00}"
    const match = slotId.match(/^slot-(\d{4}-\d{2}-\d{2})-(\d{2}:\d{2})$/);
    if (!match) return;

    const [, date, hour] = match;
    scheduleTask(taskId, date, hour);
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={[snapCenterToCursor]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}

      {/* Drag overlay: the floating card shown while dragging */}
      <DragOverlay>
        {activeTask ? (
          <div className="px-3 py-2 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 text-sm font-medium text-slate-800 opacity-95 cursor-grabbing max-w-[200px] truncate">
            {activeTask.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});
