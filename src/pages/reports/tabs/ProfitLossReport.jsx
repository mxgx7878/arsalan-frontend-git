import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineRefresh,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineChartBar,
} from "react-icons/hi";
import reportApi from "../../../api/reportApi";
import StatCard from "../components/StatCard";

const formatAmount = (val) => {
  const num = parseFloat(val) || 0;
  return num.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const profitColor = (val) =>
  parseFloat(val) >= 0 ? "text-emerald-400" : "text-red-400";

const profitBg = (val) =>
  parseFloat(val) >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400";

export default function ProfitLossReport() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [startDate, setStartDate]     = useState("");
  const [endDate, setEndDate]         = useState("");
  const [granularity, setGranularity] = useState("monthly");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { granularity };
      if (startDate) params.start_date = startDate;
      if (endDate)   params.end_date   = endDate;

      const res = await reportApi.profitLossReport(params);
      setData(res.data?.data ?? null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load P&L report");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, granularity]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const overall   = data?.overall   ?? {};
  const breakdown = data?.breakdown ?? [];

  // Margin percentage
  const margin = overall.total_revenue > 0
    ? ((overall.net_profit / overall.total_revenue) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Profit & Loss Report</h2>
        <button onClick={fetchReport} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard label="Total Revenue"    value={`Rs ${formatAmount(overall.total_revenue)}`}           icon={HiOutlineCurrencyDollar} color="amber" />
        <StatCard label="Total Expenses"   value={`Rs ${formatAmount(overall.total_expenses)}`}          icon={HiOutlineTrendingDown}   color="red" />
        <StatCard label="Net Profit"       value={`Rs ${formatAmount(overall.net_profit)}`}              icon={HiOutlineTrendingUp}     color={parseFloat(overall.net_profit) >= 0 ? "green" : "red"} />
        <StatCard label="Profit Margin"    value={`${margin}%`}                                          icon={HiOutlineChartBar}       color={parseFloat(margin) >= 0 ? "green" : "red"} />
      </div>

      {/* P&L Summary Block */}
      {data && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Overall P&L Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-sm text-slate-400">Total Revenue</span>
              <span className="text-sm font-semibold text-amber-400 font-mono">+ Rs {formatAmount(overall.total_revenue)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-sm text-slate-400">Personal Expenses (Company Cost)</span>
              <span className="text-sm font-semibold text-red-400 font-mono">− Rs {formatAmount(overall.total_personal_expenses)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-sm text-slate-400">Party Expenses (Billed to Client)</span>
              <span className="text-sm font-semibold text-blue-400 font-mono">+ Rs {formatAmount(overall.total_party_expenses)}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm font-bold text-white">Net Profit</span>
              <span className={`text-base font-bold font-mono ${profitColor(overall.net_profit)}`}>
                = Rs {formatAmount(overall.net_profit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">From Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">To Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div className="sm:w-40">
            <label className="block text-xs text-slate-500 mb-1">Granularity</label>
            <div className="flex rounded-lg overflow-hidden border border-slate-700">
              {["monthly", "daily"].map((g) => (
                <button key={g} onClick={() => setGranularity(g)}
                  className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
                    granularity === g ? "bg-amber-500 text-slate-900" : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          {(startDate || endDate) && (
            <div className="flex items-end">
              <button onClick={() => { setStartDate(""); setEndDate(""); }}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 hover:text-white transition-colors">
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">
            {granularity === "monthly" ? "Monthly" : "Daily"} Breakdown
          </h3>
          <span className="text-xs text-slate-500">{breakdown.length} periods</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {["Period", "Rides", "Revenue", "Personal Exp.", "Party Exp.", "Net Profit", "Margin"].map((h) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === "Period" ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : breakdown.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">No data found for the selected range.</td></tr>
              ) : breakdown.map((row) => {
                const rowMargin = row.total_revenue > 0
                  ? ((row.net_profit / row.total_revenue) * 100).toFixed(1)
                  : "0.0";
                return (
                  <tr key={row.period} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-white font-medium">{row.period}</td>
                    <td className="px-5 py-3.5 text-right text-slate-300">{row.total_rides}</td>
                    <td className="px-5 py-3.5 text-right text-amber-400 font-mono">Rs {formatAmount(row.total_revenue)}</td>
                    <td className="px-5 py-3.5 text-right text-red-400 font-mono">Rs {formatAmount(row.personal_expenses)}</td>
                    <td className="px-5 py-3.5 text-right text-blue-400 font-mono">Rs {formatAmount(row.party_expenses)}</td>
                    <td className={`px-5 py-3.5 text-right font-mono font-semibold ${profitColor(row.net_profit)}`}>
                      Rs {formatAmount(row.net_profit)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${profitBg(row.net_profit)}`}>
                        {rowMargin}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}