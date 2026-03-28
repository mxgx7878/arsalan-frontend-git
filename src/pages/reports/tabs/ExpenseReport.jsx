import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineRefresh,
  HiOutlineTruck,
  HiOutlineCurrencyDollar,
  HiOutlineTag,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import reportApi from "../../../api/reportApi";
import vehicleApi from "../../../api/vehicleApi";
import StatCard from "../components/StatCard";

const formatAmount = (val) => {
  const num = parseFloat(val) || 0;
  return num.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
};

const INIT_PAGINATION = { current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 };

export default function ExpenseReport() {
  const [data, setData]         = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [page, setPage]         = useState(1);
  const [pagination, setPagination] = useState(INIT_PAGINATION);

  // Filters
  const [startDate, setStartDate]     = useState("");
  const [endDate, setEndDate]         = useState("");
  const [vehicleId, setVehicleId]     = useState("");
  const [expenseType, setExpenseType] = useState("");

  useEffect(() => {
    vehicleApi.getAll({ per_page: 200 }).then((res) => setVehicles(res.data?.data?.vehicles || res.data?.data?.data || res.data?.data || [])).catch(() => {});
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 15 };
      if (startDate)    params.start_date   = startDate;
      if (endDate)      params.end_date     = endDate;
      if (vehicleId)    params.vehicle_id   = vehicleId;
      if (expenseType)  params.expense_type = expenseType;

      const res = await reportApi.expenseReport(params);
      const d   = res.data?.data ?? {};
      setData(d);
      setPagination(d.pagination ?? INIT_PAGINATION);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load expense report");
    } finally {
      setLoading(false);
    }
  }, [page, startDate, endDate, vehicleId, expenseType]);

  useEffect(() => { fetchReport(); }, [fetchReport]);
  useEffect(() => { setPage(1); }, [startDate, endDate, vehicleId, expenseType]);

  const summary          = data?.summary           ?? {};
  const vehicleBreakdown = data?.vehicle_breakdown ?? [];
  const typeBreakdown    = data?.type_breakdown    ?? [];
  const expenses         = data?.expenses          ?? [];

  const pageNumbers = Array.from({ length: pagination.last_page }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === pagination.last_page || Math.abs(p - page) <= 1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Expense Report</h2>
        <button onClick={fetchReport} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Personal Expenses" value={`Rs ${formatAmount(summary.total_personal_expenses)}`} icon={HiOutlineCurrencyDollar} color="red" />
        <StatCard label="Party Expenses"    value={`Rs ${formatAmount(summary.total_party_expenses)}`}    icon={HiOutlineCurrencyDollar} color="blue" />
        <StatCard label="Total Expenses"    value={`Rs ${formatAmount(summary.total_expenses)}`}          icon={HiOutlineCurrencyDollar} color="amber" />
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">From Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">To Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Vehicle</label>
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none">
              <option value="">All Vehicles</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.vehicle_number}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Expense Type</label>
            <select value={expenseType} onChange={(e) => setExpenseType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none">
              <option value="">All Types</option>
              <option value="personal">Personal</option>
              <option value="party">Party</option>
            </select>
          </div>
        </div>
        {(startDate || endDate || vehicleId || expenseType) && (
          <div className="mt-3">
            <button onClick={() => { setStartDate(""); setEndDate(""); setVehicleId(""); setExpenseType(""); }}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 text-xs hover:bg-slate-800 hover:text-white transition-colors">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Two-column breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Vehicle Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
            <HiOutlineTruck className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-300">By Vehicle</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase text-left">Vehicle</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase text-right">Personal</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase text-right">Party</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>{[1,2,3,4].map((j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>)}</tr>
                  ))
                ) : vehicleBreakdown.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-6 text-slate-500 text-xs">No data</td></tr>
                ) : vehicleBreakdown.map((v) => (
                  <tr key={v.vehicle_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300">
                      <div className="font-medium">{v.vehicle_number}</div>
                      <div className="text-xs text-slate-500 capitalize">{v.vehicle_type}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-red-400 font-mono text-xs">Rs {formatAmount(v.personal_expenses)}</td>
                    <td className="px-4 py-3 text-right text-blue-400 font-mono text-xs">Rs {formatAmount(v.party_expenses)}</td>
                    <td className="px-4 py-3 text-right text-amber-400 font-mono text-xs font-semibold">Rs {formatAmount(v.total_expenses)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Type Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
            <HiOutlineTag className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-300">By Type</h3>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-16 bg-slate-800 rounded-lg animate-pulse" />)
            ) : typeBreakdown.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-6">No data</p>
            ) : typeBreakdown.map((t) => {
              const isPersonal = t.expense_type === "personal";
              return (
                <div key={t.expense_type} className={`rounded-lg p-4 ${isPersonal ? "bg-red-500/5 border border-red-500/20" : "bg-blue-500/5 border border-blue-500/20"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold capitalize ${isPersonal ? "text-red-400" : "text-blue-400"}`}>{t.expense_type}</span>
                    <span className="text-xs text-slate-500">{t.count} entries</span>
                  </div>
                  <p className={`text-xl font-bold font-mono ${isPersonal ? "text-red-300" : "text-blue-300"}`}>
                    Rs {formatAmount(t.total_amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300">Expense Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {["Date", "Ride #", "Vehicle", "Type", "Note", "Amount"].map((h) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : expenses.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">No expenses found.</td></tr>
              ) : expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap text-xs">{fmtDate(e.ride?.start_date)}</td>
                  <td className="px-5 py-3.5 text-amber-400">{e.ride?.ride_number || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-300">{e.ride?.vehicle?.vehicle_number || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      e.expense_type === "personal" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                    }`}>{e.expense_type}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs max-w-[160px] truncate" title={e.expense_note}>{e.expense_note || "—"}</td>
                  <td className="px-5 py-3.5 text-right text-amber-400 font-mono">Rs {formatAmount(e.expense_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <p className="text-xs text-slate-500">Showing {pagination.from ?? 0}–{pagination.to ?? 0} of {pagination.total}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors">
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              {pageNumbers.map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showDots = prev && p - prev > 1;
                return (
                  <span key={p} className="flex items-center">
                    {showDots && <span className="px-1 text-slate-600 text-xs">…</span>}
                    <button onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-amber-500 text-slate-900" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                      {p}
                    </button>
                  </span>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))} disabled={page >= pagination.last_page}
                className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors">
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}