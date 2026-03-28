// Shared StatCard used across all report tabs
// Follows the same inline pattern found in VehicleExpensesPage, RidesPage, etc.

const colorMap = {
  // Blues
  blue: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  // Greens
  green: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  // Ambers
  amber: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  yellow: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  // Reds
  red: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  // Purples
  purple: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  // Slates / defaults
  slate: { text: "text-slate-300", bg: "bg-slate-800/50", border: "border-slate-700/50" },
  white: { text: "text-white", bg: "bg-slate-800/50", border: "border-slate-700/50" },
};

export default function StatCard({ label, value, icon: Icon, color = "slate", subLabel }) {
  const c = colorMap[color] || colorMap.slate;

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-4`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider leading-tight">
          {label}
        </p>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${c.text}`} />
          </div>
        )}
      </div>
      <p className={`text-xl font-bold mt-2 ${c.text} truncate`}>{value}</p>
      {subLabel && <p className="text-xs text-slate-600 mt-1">{subLabel}</p>}
    </div>
  );
}