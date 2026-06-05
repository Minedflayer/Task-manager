import { Sidebar } from "@/components/sidebar/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen w-full bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
        {/* We will add calendar and task lists here in subsequent phases */}
      </main>
    </div>
  );
}
