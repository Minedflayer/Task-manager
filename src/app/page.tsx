import { Sidebar } from "@/components/sidebar/Sidebar";
import { CreateTask } from "@/components/tasks/CreateTask";
import { TaskList } from "@/components/tasks/TaskList";

export default function Home() {
  return (
    <div className="flex h-screen w-full bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Dashboard</h1>
        <div className="max-w-3xl">
          <CreateTask />
          <div className="mt-8">
            <h2 className="text-lg font-medium text-slate-800 mb-4">Your Tasks</h2>
            <TaskList />
          </div>
        </div>
        {/* We will add calendar here in subsequent phases */}
      </main>
    </div>
  );
}
