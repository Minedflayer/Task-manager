"use client";

import { useState } from "react";
import { observer } from "@legendapp/state/react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays, Calendar } from "lucide-react";
import { state$, Task } from "@/lib/state/store";
import { getWeekDays, getDayHours, formatDate, formatTime } from "@/lib/calendar/calendarUtils";

// Abbreviated day names for column headers
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Hours to display in the calendar (06:00 – 22:00 to keep it compact)
const VISIBLE_HOURS = getDayHours().slice(6, 23);

interface CalendarViewProps {
  /** For testing: override the reference date (defaults to today) */
  referenceDate?: Date;
}

export const CalendarView = observer(function CalendarView({
  referenceDate,
}: CalendarViewProps) {
  const [view, setView] = useState<"weekly" | "daily">("weekly");
  const [currentDate, setCurrentDate] = useState<Date>(referenceDate ?? new Date());

  const tasks = state$.tasks.get();

  const weekDays = getWeekDays(currentDate);
  const todayStr = formatDate(new Date());
  const currentDateStr = formatDate(currentDate);

  function navigate(direction: -1 | 1) {
    const next = new Date(currentDate);
    if (view === "weekly") {
      next.setUTCDate(next.getUTCDate() + direction * 7);
    } else {
      next.setUTCDate(next.getUTCDate() + direction);
    }
    setCurrentDate(next);
  }

  /** Tasks scheduled for a given date + hour (hour as "HH:00") */
  function getTasksForSlot(dateStr: string, hour: string): Task[] {
    return tasks.filter(
      (t) =>
        t.scheduled_date === dateStr &&
        t.scheduled_time?.startsWith(hour.slice(0, 2))
    );
  }

  return (
    <div className="flex flex-col bg-white/70 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Previous"
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-slate-700 min-w-[120px] text-center">
            {view === "weekly"
              ? `${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
              : currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </span>
          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label="Next"
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setView("daily")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === "daily"
                ? "bg-white shadow-sm text-slate-800"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Calendar size={13} />
            Daily
          </button>
          <button
            type="button"
            onClick={() => setView("weekly")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === "weekly"
                ? "bg-white shadow-sm text-slate-800"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <CalendarDays size={13} />
            Weekly
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="overflow-auto"
          style={{ maxHeight: "calc(100vh - 280px)" }}
        >
          {view === "weekly" ? (
            <WeeklyGrid
              weekDays={weekDays}
              todayStr={todayStr}
              hours={VISIBLE_HOURS}
              getTasksForSlot={getTasksForSlot}
            />
          ) : (
            <DailyColumn
              dateStr={currentDateStr}
              hours={VISIBLE_HOURS}
              getTasksForSlot={getTasksForSlot}
              isToday={currentDateStr === todayStr}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

// ── Weekly grid ──────────────────────────────────────────────────────────────

interface WeeklyGridProps {
  weekDays: Date[];
  todayStr: string;
  hours: string[];
  getTasksForSlot: (date: string, hour: string) => Task[];
}

function WeeklyGrid({ weekDays, todayStr, hours, getTasksForSlot }: WeeklyGridProps) {
  return (
    <div className="grid" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
      {/* Day header row */}
      <div className="sticky top-0 bg-white/90 z-10 border-b border-slate-100" />
      {weekDays.map((day, i) => {
        const dateStr = formatDate(day);
        const isToday = dateStr === formatDate(new Date());
        return (
          <div
            key={dateStr}
            className={`sticky top-0 bg-white/90 z-10 border-b border-slate-100 flex flex-col items-center py-2 text-xs font-semibold ${
              isToday ? "text-indigo-600" : "text-slate-500"
            }`}
          >
            <span>{DAY_NAMES[i]}</span>
            <span
              className={`mt-0.5 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
                isToday ? "bg-indigo-600 text-white" : "text-slate-700"
              }`}
            >
              {day.getUTCDate()}
            </span>
          </div>
        );
      })}

      {/* Hour rows */}
      {hours.map((hour) => (
        <div key={hour} className="contents">
          {/* Time label */}
          <div className="border-t border-slate-50 pr-2 pt-1 text-right text-xs text-slate-400 select-none h-14">
            {hour}
          </div>

          {/* Day cells */}
          {weekDays.map((day) => {
            const dateStr = formatDate(day);
            const slotTasks = getTasksForSlot(dateStr, hour);
            return (
              <CalendarSlot
                key={`${dateStr}-${hour}`}
                dateStr={dateStr}
                hour={hour}
                tasks={slotTasks}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Daily column ─────────────────────────────────────────────────────────────

interface DailyColumnProps {
  dateStr: string;
  hours: string[];
  getTasksForSlot: (date: string, hour: string) => Task[];
  isToday: boolean;
}

function DailyColumn({ dateStr, hours, getTasksForSlot, isToday }: DailyColumnProps) {
  return (
    <div>
      <div className="sticky top-0 bg-white/90 z-10 border-b border-slate-100 py-3 px-5 text-sm font-semibold text-slate-700">
        {isToday ? "Today" : dateStr}
      </div>
      <div className="grid" style={{ gridTemplateColumns: "56px 1fr" }}>
        {hours.map((hour) => {
          const slotTasks = getTasksForSlot(dateStr, hour);
          return (
            <div key={hour} className="contents">
              <div className="border-t border-slate-50 pr-2 pt-1 text-right text-xs text-slate-400 select-none h-14">
                {hour}
              </div>
              <CalendarSlot
                dateStr={dateStr}
                hour={hour}
                tasks={slotTasks}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Individual slot ──────────────────────────────────────────────────────────

interface CalendarSlotProps {
  dateStr: string;
  hour: string;
  tasks: Task[];
}

function CalendarSlot({ dateStr, hour, tasks }: CalendarSlotProps) {
  const slotId = `slot-${dateStr}-${hour}`;
  const categories = state$.categories.get();

  return (
    <div
      id={slotId}
      data-date={dateStr}
      data-hour={hour}
      className="border-t border-slate-50 h-14 p-0.5 relative hover:bg-slate-50/60 transition-colors"
    >
      {tasks.map((task) => {
        const cat = categories.find((c) => c.id === task.category_id);
        return (
          <div
            key={task.id}
            className="absolute inset-x-0.5 inset-y-0.5 rounded-lg px-2 py-1 text-xs font-medium truncate flex items-center gap-1.5"
            style={{
              backgroundColor: cat ? `${cat.color}cc` : "#e2e8f0",
              color: "#1e293b",
            }}
          >
            {cat && (
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
            )}
            {task.title}
          </div>
        );
      })}
    </div>
  );
}
