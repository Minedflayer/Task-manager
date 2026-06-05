import { Sidebar } from "@/components/sidebar/Sidebar";
import { CreateTask } from "@/components/tasks/CreateTask";
import { TaskList } from "@/components/tasks/TaskList";
import { CalendarView } from "@/components/calendar/CalendarView";
import { DndProvider } from "@/components/calendar/DndProvider";

export default function Home() {
  return (
    <div className="flex h-screen w-full bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Dashboard</h1>
        <DndProvider>
          <div className="flex gap-8 items-start">
            {/* Tasks column */}
            <div className="flex-none w-full max-w-sm">
              <CreateTask />
              <div className="mt-6">
                <h2 className="text-lg font-medium text-slate-800 mb-4">Your Tasks</h2>
                <TaskList />
              </div>
            </div>
            {/* Calendar column */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-medium text-slate-800 mb-4">Calendar</h2>
              <CalendarView />
            </div>
          </div>
        </DndProvider>
      </main>
    </div>
  );
}


