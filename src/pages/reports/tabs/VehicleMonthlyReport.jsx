import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineRefresh,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineTruck,
  HiOutlineCurrencyDollar,
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

export default function VehicleMonthlyReport() {
  const [data, setData]         = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [expanded, setExpanded] = useState({});

  // Filters
  const [vehicleId, setVehicleId] = useState("");
  const [year, setYear]           = useState(new Date().getFullYear().toString());

  useEffect(() => {
    vehicleApi.getAll({ per_page: 200 }).then((res) => {
      setVehicles(res.data?.data?.vehicles || res.data?.data?.data || res.data?.data || []);
    }).catch(() => {});
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { year };
      if (vehicleId) params.vehicle_id = vehicleId;

      const res = await reportApi.vehicleMonthlyReport(params);
      setData(res.data?.data ?? null);
      // Auto-expand first vehicle
      const vs = res.data?.data?.vehicles ?? [];
      if (vs.length > 0) setExpanded({ [vs[0].vehicle_id]: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load vehicle monthly report");
    } finally {
      setLoading(false);
    }
  }, [vehicleId, year]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const vehicleRows = data?.vehicles ?? [];

  const yearOptions = [];
  for (let y = new Date().getFullYear(); y >= 2020; y--) {
    yearOptions.push(y);
  }

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Overall totals across all vehicles
  const grandTotals = vehicleRows.reduce((acc, v) => ({
    total_rides:       acc.total_rides + (v.yearly_totals?.total_rides || 0),
    total_revenue:     acc.total_revenue + (v.yearly_totals?.total_revenue || 0),
    personal_expenses: acc.personal_expenses + (v.yearly_totals?.personal_expenses || 0),
    party_expenses:    acc.party_expenses + (v.yearly_totals?.party_expenses || 0),
    profit:            acc.profit + (v.yearly_totals?.profit || 0),
  }), { total_rides: 0, total_revenue: 0, personal_expenses: 0, party_expenses: 0, profit: 0 });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Vehicle Monthly Report</h2>
        <button
          onClick={fetchReport}
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard label="Total Vehicles" value={vehicleRows.length}                              icon={HiOutlineTruck}         color="blue" />
          <StatCard label="Total Revenue"  value={`Rs ${formatAmount(grandTotals.total_revenue)}`} icon={HiOutlineCurrencyDollar} color="amber" />
          <StatCard label="Total Expenses" value={`Rs ${formatAmount(grandTotals.personal_expenses)}`} icon={HiOutlineCurrencyDollar} color="red" />
          <StatCard label="Net Profit"     value={`Rs ${formatAmount(grandTotals.profit)}`}        icon={HiOutlineCurrencyDollar} color={grandTotals.profit >= 0 ? "green" : "red"} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Vehicle</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.vehicle_number}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Accordion per vehicle */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="h-5 bg-slate-800 rounded animate-pulse w-48" />
            </div>
          ))
        ) : vehicleRows.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl py-12 text-center text-slate-500">
            No data found. Try adjusting the year or vehicle filter.
          </div>
        ) : (
          vehicleRows.map((veh) => {
            const isOpen = !!expanded[veh.vehicle_id];
            const yt     = veh.yearly_totals || {};
            return (
              <div key={veh.vehicle_id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {/* Vehicle header row */}
                <button
                  onClick={() => toggleExpand(veh.vehicle_id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {isOpen
                      ? <HiOutlineChevronDown className="w-4 h-4 text-amber-500" />
                      : <HiOutlineChevronRight className="w-4 h-4 text-slate-400" />
                    }
                    <div>
                      <p className="text-sm font-semibold text-white">{veh.vehicle_number}</p>
                      <p className="text-xs text-slate-500 capitalize">{veh.vehicle_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-xs text-slate-500">Rides</p>
                      <p className="text-sm font-medium text-white">{yt.total_rides ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Revenue</p>
                      <p className="text-sm font-medium text-amber-400">Rs {formatAmount(yt.total_revenue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Profit</p>
                      <p className={`text-sm font-semibold ${profitColor(yt.profit)}`}>Rs {formatAmount(yt.profit)}</p>
                    </div>
                  </div>
                </button>

                {/* Monthly breakdown table */}
                {isOpen && (
                  <div className="border-t border-slate-800">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-800/30">
                            {["Month", "Rides", "Revenue", "Personal Exp.", "Party Exp.", "Profit"].map((h) => (
                              <th key={h} className={`px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === "Month" ? "text-left" : "text-right"}`}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {veh.months?.map((m) => (
                            <tr key={`${m.month}-${m.year}`} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-5 py-3 text-slate-300 font-medium">{m.month_name} {m.year}</td>
                              <td className="px-5 py-3 text-right text-slate-300">{m.total_rides}</td>
                              <td className="px-5 py-3 text-right text-amber-400 font-mono">Rs {formatAmount(m.total_revenue)}</td>
                              <td className="px-5 py-3 text-right text-red-400 font-mono">Rs {formatAmount(m.personal_expenses)}</td>
                              <td className="px-5 py-3 text-right text-blue-400 font-mono">Rs {formatAmount(m.party_expenses)}</td>
                              <td className={`px-5 py-3 text-right font-mono font-semibold ${profitColor(m.profit)}`}>
                                Rs {formatAmount(m.profit)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-slate-700 bg-slate-800/50">
                            <td className="px-5 py-2.5 text-xs font-bold text-slate-400 uppercase">Yearly Total</td>
                            <td className="px-5 py-2.5 text-right font-bold text-white">{yt.total_rides}</td>
                            <td className="px-5 py-2.5 text-right font-bold text-amber-400 font-mono">Rs {formatAmount(yt.total_revenue)}</td>
                            <td className="px-5 py-2.5 text-right font-bold text-red-400 font-mono">Rs {formatAmount(yt.personal_expenses)}</td>
                            <td className="px-5 py-2.5 text-right font-bold text-blue-400 font-mono">Rs {formatAmount(yt.party_expenses)}</td>
                            <td className={`px-5 py-2.5 text-right font-bold font-mono ${profitColor(yt.profit)}`}>
                              Rs {formatAmount(yt.profit)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}