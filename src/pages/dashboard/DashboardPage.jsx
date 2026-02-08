import { HiOutlineCog } from "react-icons/hi";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
        <HiOutlineCog className="w-8 h-8 text-amber-500 animate-spin" style={{ animationDuration: "3s" }} />
      </div>
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>
      <p className="text-slate-500 mt-2 text-sm">Developing soon</p>
      <div className="flex items-center gap-2 mt-6 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-xs text-slate-400">Under construction</span>
      </div>
    </div>
  );
}
