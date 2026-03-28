import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineRefresh,
  HiOutlineTruck,
  HiOutlineMap,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import reportApi from "../../../api/reportApi";
import vehicleApi from "../../../api/vehicleApi";
import StatCard from "../components/StatCard";

const formatAmount = (val) => {
  const num = parseFloat(val) || 0;
  return num.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const profitColor = (val) =>
  parseFloat(val) >= 0 ? "text-emerald-400" : "text-red-400";

export default function VehicleReport() {
  const [data, setData]       = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [startDate, setStartDate]     = useState("");
  const [endDate, setEndDate]         = useState("");
  const [vehicleId, setVehicleId]     = useState("");

  // Fetch vehicle list for dropdown
  useEffect(() => {
    vehicleApi.getAll({ per_page: 200 }).then((res) => {
      setVehicles(res.data?.data?.vehicles || res.data?.data?.data || res.data?.data || []);
    }).catch(() => {});
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate)  params.start_date  = startDate;
      if (endDate)    params.end_date    = endDate;
      if (vehicleId)  params.vehicle_id  = vehicleId;

      const res = await reportApi.vehicleReport(params);
      setData(res.data?.data ?? null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load vehicle report");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, vehicleId]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const totals   = data?.totals   ?? {};
  const rows     = data?.vehicles ?? [];

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setVehicleId("");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Per Vehicle Report</h2>
        <button
          onClick={fetchReport}
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard label="Total Rides"    value={totals.total_rides ?? 0}                            icon={HiOutlineMap}            color="blue" />
          <StatCard label="Total Revenue"  value={`Rs ${formatAmount(totals.total_booking_amount)}`}  icon={HiOutlineCurrencyDollar} color="amber" />
          <StatCard label="Total Expenses" value={`Rs ${formatAmount((totals.total_personal_expenses || 0))}`} icon={HiOutlineTruck} color="red" />
          <StatCard label="Net Profit"     value={`Rs ${formatAmount(totals.net_profit)}`}             icon={HiOutlineTrendingUp}    color={parseFloat(totals.net_profit) >= 0 ? "green" : "red"} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Vehicle</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.vehicle_number}</option>
              ))}
            </select>
          </div>
          {(startDate || endDate || vehicleId) && (
            <div className="flex items-end">
              <button
                onClick={handleClear}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {["Vehicle", "Type", "Status", "Total Rides", "Revenue", "Personal Exp.", "Party Exp.", "Net Profit"].map((h) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === "Vehicle" || h === "Type" || h === "Status" ? "text-left" : "text-right"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-slate-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No vehicle data found for the selected filters.
                  </td>
                </tr>
              ) : (
                rows.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-white font-medium">{v.vehicle_number}</td>
                    <td className="px-5 py-3.5 text-slate-300 capitalize">{v.type}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        v.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${v.status === "active" ? "bg-emerald-400" : "bg-red-400"}`} />
                        {v.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-300">{v.total_rides}</td>
                    <td className="px-5 py-3.5 text-right text-amber-400 font-mono">Rs {formatAmount(v.total_booking_amount)}</td>
                    <td className="px-5 py-3.5 text-right text-red-400 font-mono">Rs {formatAmount(v.total_personal_expenses)}</td>
                    <td className="px-5 py-3.5 text-right text-blue-400 font-mono">Rs {formatAmount(v.total_party_expenses)}</td>
                    <td className={`px-5 py-3.5 text-right font-mono font-semibold ${profitColor(v.net_profit)}`}>
                      Rs {formatAmount(v.net_profit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Totals row */}
            {!loading && rows.length > 1 && (
              <tfoot>
                <tr className="border-t-2 border-slate-700 bg-slate-800/50">
                  <td colSpan={3} className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Totals</td>
                  <td className="px-5 py-3 text-right font-bold text-white">{totals.total_rides}</td>
                  <td className="px-5 py-3 text-right font-bold text-amber-400 font-mono">Rs {formatAmount(totals.total_booking_amount)}</td>
                  <td className="px-5 py-3 text-right font-bold text-red-400 font-mono">Rs {formatAmount(totals.total_personal_expenses)}</td>
                  <td className="px-5 py-3 text-right font-bold text-blue-400 font-mono">Rs {formatAmount(totals.total_party_expenses)}</td>
                  <td className={`px-5 py-3 text-right font-bold font-mono ${profitColor(totals.net_profit)}`}>
                    Rs {formatAmount(totals.net_profit)}
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