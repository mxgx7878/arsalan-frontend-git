import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineRefresh,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineMap,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import reportApi from "../../../api/reportApi";
import vehicleApi from "../../../api/vehicleApi";
import partyApi from "../../../api/partyApi";
import StatCard from "../components/StatCard";

const formatAmount = (val) => {
  const num = parseFloat(val) || 0;
  return num.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const profitColor = (val) =>
  parseFloat(val) >= 0 ? "text-emerald-400" : "text-red-400";

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
};

const INIT_PAGINATION = { current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 };

export default function RideReport() {
  const [rides, setRides]         = useState([]);
  const [pagination, setPagination] = useState(INIT_PAGINATION);
  const [loading, setLoading]     = useState(false);
  const [page, setPage]           = useState(1);
  const [vehicles, setVehicles]   = useState([]);
  const [parties, setParties]     = useState([]);

  // Totals derived from current page (approximate)
  const [summaryStats, setSummaryStats] = useState(null);

  // Filters
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [vehicleId, setVehicleId]   = useState("");
  const [partyId, setPartyId]       = useState("");
  const [rideType, setRideType]     = useState("");
  const [isCompleted, setIsCompleted] = useState("");

  useEffect(() => {
    vehicleApi.getAll({ per_page: 200 }).then((res) => setVehicles(res.data?.data?.vehicles || res.data?.data?.data || res.data?.data || [])).catch(() => {});
    partyApi.getAll({ per_page: 200 }).then((res) => setParties(res.data?.data?.parties || res.data?.data?.data || res.data?.data || [])).catch(() => {});
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 15 };
      if (startDate)    params.start_date  = startDate;
      if (endDate)      params.end_date    = endDate;
      if (vehicleId)    params.vehicle_id  = vehicleId;
      if (partyId)      params.party_id    = partyId;
      if (rideType)     params.ride_type   = rideType;
      if (isCompleted !== "") params.is_completed = isCompleted;

      const res = await reportApi.rideReport(params);
      const d   = res.data?.data ?? {};
      setRides(d.rides ?? []);
      setPagination(d.pagination ?? INIT_PAGINATION);

      // Compute page-level summary
      const r = d.rides ?? [];
      setSummaryStats({
        total_rides:   r.length,
        total_revenue: r.reduce((a, x) => a + (x.financial_summary?.booking_amount || 0), 0),
        total_expenses: r.reduce((a, x) => a + (x.financial_summary?.total_expenses || 0), 0),
        total_profit:  r.reduce((a, x) => a + (x.financial_summary?.profit || 0), 0),
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load ride report");
    } finally {
      setLoading(false);
    }
  }, [page, startDate, endDate, vehicleId, partyId, rideType, isCompleted]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [startDate, endDate, vehicleId, partyId, rideType, isCompleted]);

  const handleClear = () => {
    setStartDate(""); setEndDate(""); setVehicleId("");
    setPartyId(""); setRideType(""); setIsCompleted(""); setPage(1);
  };

  const pageNumbers = Array.from({ length: pagination.last_page }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === pagination.last_page || Math.abs(p - page) <= 1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Ride Report</h2>
        <button onClick={fetchReport} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Cards */}
      {summaryStats && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard label="Rides (Page)"    value={pagination.total}                               icon={HiOutlineMap}            color="blue" />
          <StatCard label="Revenue"         value={`Rs ${formatAmount(summaryStats.total_revenue)}`} icon={HiOutlineCurrencyDollar} color="amber" />
          <StatCard label="Expenses"        value={`Rs ${formatAmount(summaryStats.total_expenses)}`} icon={HiOutlineCurrencyDollar} color="red" />
          <StatCard label="Profit"          value={`Rs ${formatAmount(summaryStats.total_profit)}`}  icon={HiOutlineTrendingUp}     color={summaryStats.total_profit >= 0 ? "green" : "red"} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
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
            <label className="block text-xs text-slate-500 mb-1">Party</label>
            <select value={partyId} onChange={(e) => setPartyId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none">
              <option value="">All Parties</option>
              {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Type</label>
            <select value={rideType} onChange={(e) => setRideType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none">
              <option value="">All Types</option>
              <option value="personal">Own Vehicle</option>
              <option value="partner">Market</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Status</label>
            <select value={isCompleted} onChange={(e) => setIsCompleted(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none">
              <option value="">All</option>
              <option value="1">Completed</option>
              <option value="0">Pending</option>
            </select>
          </div>
        </div>
        {(startDate || endDate || vehicleId || partyId || rideType || isCompleted !== "") && (
          <div className="mt-3">
            <button onClick={handleClear} className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 text-xs hover:bg-slate-800 hover:text-white transition-colors">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {["Ride #", "Date", "Route", "Vehicle", "Party", "Type", "Status", "Booking", "Expenses", "Profit"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                    ["Booking", "Expenses", "Profit"].includes(h) ? "text-right" : "text-left"
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 10 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : rides.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-slate-500">No rides found for the selected filters.</td></tr>
              ) : rides.map((r) => {
                const fs = r.financial_summary || {};
                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-amber-400 font-medium">{r.ride_number}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{fmtDate(r.start_date)}</td>
                    <td className="px-4 py-3 text-slate-300 max-w-[120px] truncate" title={r.route}>{r.route || "—"}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{r.vehicle?.vehicle_number || "—"}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{r.party?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.ride_type === "personal" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                      }`}>
                        {r.ride_type === "personal" ? "Own" : "Market"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.is_completed ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${r.is_completed ? "bg-emerald-400" : "bg-amber-400"}`} />
                        {r.is_completed ? "Done" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-amber-400 font-mono">Rs {formatAmount(fs.booking_amount)}</td>
                    <td className="px-4 py-3 text-right text-red-400 font-mono">Rs {formatAmount(fs.total_expenses)}</td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold ${profitColor(fs.profit)}`}>Rs {formatAmount(fs.profit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Showing {pagination.from ?? 0}–{pagination.to ?? 0} of {pagination.total}
            </p>
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
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        p === page ? "bg-amber-500 text-slate-900" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}>
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