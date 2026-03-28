import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineRefresh,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineMap,
} from "react-icons/hi";
import reportApi from "../../../api/reportApi";
import StatCard from "../components/StatCard";

const formatAmount = (val) => {
  const num = parseFloat(val) || 0;
  return num.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const profitColor = (val) =>
  parseFloat(val) >= 0 ? "text-emerald-400" : "text-red-400";

// Default to current month
const todayStr  = new Date().toISOString().split("T")[0];
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

export default function DailySummaryReport() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Filters — both required by API
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate]     = useState(todayStr);

  const fetchReport = useCallback(async () => {
    if (!startDate || !endDate) {
      setError("Both start date and end date are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await reportApi.dailySummaryReport({ start_date: startDate, end_date: endDate });
      setData(res.data?.data ?? null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load daily summary");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const summary = data?.summary ?? {};
  const days    = data?.days    ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Daily Summary Report</h2>
        <button onClick={fetchReport} disabled={!startDate || !endDate}
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard label="Days Covered"   value={summary.total_days ?? 0}                                icon={HiOutlineCalendar}       color="blue" />
          <StatCard label="Total Revenue"  value={`Rs ${formatAmount(summary.total_revenue)}`}            icon={HiOutlineCurrencyDollar} color="amber" />
          <StatCard label="Total Expenses" value={`Rs ${formatAmount(summary.total_expenses)}`}           icon={HiOutlineCurrencyDollar} color="red" />
          <StatCard label="Total Profit"   value={`Rs ${formatAmount(summary.total_profit)}`}             icon={HiOutlineTrendingUp}     color={parseFloat(summary.total_profit) >= 0 ? "green" : "red"} />
        </div>
      )}

      {/* Date Filters — both required */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <HiOutlineCalendar className="w-4 h-4 text-amber-500" />
          <p className="text-xs text-amber-500 font-medium">Both dates are required for this report</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Start Date <span className="text-red-400">*</span></label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">End Date <span className="text-red-400">*</span></label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => { setStartDate(firstOfMonth); setEndDate(todayStr); }}
              className="px-4 py-2 rounded-lg border border-amber-500/30 text-amber-400 text-sm hover:bg-amber-500/10 transition-colors whitespace-nowrap"
            >
              This Month
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>

      {/* Daily Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {["Date", "Rides", "Revenue", "Personal Exp.", "Party Exp.", "Total Exp.", "Daily Profit"].map((h) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === "Date" ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : days.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    {startDate && endDate ? "No rides found in the selected date range." : "Select a date range to view the report."}
                  </td>
                </tr>
              ) : days.map((d) => (
                <tr key={d.date} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 text-white font-medium">{d.date}</td>
                  <td className="px-5 py-3.5 text-right text-slate-300">{d.total_rides}</td>
                  <td className="px-5 py-3.5 text-right text-amber-400 font-mono">Rs {formatAmount(d.daily_revenue)}</td>
                  <td className="px-5 py-3.5 text-right text-red-400 font-mono">Rs {formatAmount(d.personal_expenses)}</td>
                  <td className="px-5 py-3.5 text-right text-blue-400 font-mono">Rs {formatAmount(d.party_expenses)}</td>
                  <td className="px-5 py-3.5 text-right text-slate-300 font-mono">Rs {formatAmount(d.daily_expenses)}</td>
                  <td className={`px-5 py-3.5 text-right font-mono font-semibold ${profitColor(d.daily_profit)}`}>
                    Rs {formatAmount(d.daily_profit)}
                  </td>
                </tr>
              ))}
            </tbody>

            {!loading && days.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-700 bg-slate-800/50">
                  <td className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total ({summary.total_days} days)
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-white">{summary.total_rides}</td>
                  <td className="px-5 py-3 text-right font-bold text-amber-400 font-mono">Rs {formatAmount(summary.total_revenue)}</td>
                  <td className="px-5 py-3 text-right font-bold text-red-400 font-mono">Rs {formatAmount(summary.total_personal_expenses)}</td>
                  <td className="px-5 py-3 text-right font-bold text-blue-400 font-mono">Rs {formatAmount(summary.total_party_expenses)}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-300 font-mono">Rs {formatAmount(summary.total_expenses)}</td>
                  <td className={`px-5 py-3 text-right font-bold font-mono ${profitColor(summary.total_profit)}`}>
                    Rs {formatAmount(summary.total_profit)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}