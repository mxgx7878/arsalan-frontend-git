import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineRefresh,
  HiOutlineTruck,
  HiOutlineUsers,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineMap,
} from "react-icons/hi";
import reportApi from "../../../api/reportApi";

const formatAmount = (val) => {
  const num = parseFloat(val) || 0;
  return num.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const profitColor = (val) =>
  parseFloat(val) >= 0 ? "text-emerald-400" : "text-red-400";

function ComparisonCard({ title, icon: Icon, color, data }) {
  const colorClasses = {
    amber: { border: "border-amber-500/30", bg: "bg-amber-500/5", icon: "text-amber-500", iconBg: "bg-amber-500/10", label: "text-amber-400" },
    blue:  { border: "border-blue-500/30",  bg: "bg-blue-500/5",  icon: "text-blue-500",  iconBg: "bg-blue-500/10",  label: "text-blue-400"  },
  };
  const c = colorClasses[color] || colorClasses.amber;

  return (
    <div className={`bg-slate-900 border ${c.border} rounded-xl p-5`}>
      <div className={`flex items-center gap-3 pb-4 mb-4 border-b border-slate-800`}>
        <div className={`w-9 h-9 rounded-lg ${c.iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>

      <div className="space-y-3">
        {[
          { label: "Total Rides",         value: data?.total_rides ?? 0,                                  isCurrency: false },
          { label: "Total Revenue",       value: `Rs ${formatAmount(data?.total_revenue)}`,               isCurrency: true  },
          { label: "Personal Expenses",   value: `Rs ${formatAmount(data?.personal_expenses)}`,           isCurrency: true  },
          { label: "Party Expenses",      value: `Rs ${formatAmount(data?.party_expenses)}`,              isCurrency: true  },
          { label: "Total Expenses",      value: `Rs ${formatAmount(data?.total_expenses)}`,              isCurrency: true  },
          { label: "Net Profit",          value: `Rs ${formatAmount(data?.profit)}`,                      isCurrency: true, profit: data?.profit  },
        ].map(({ label, value, profit }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{label}</span>
            <span className={`text-sm font-semibold font-mono ${profit !== undefined ? profitColor(profit) : "text-white"}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MarketVsOwnReport() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate)   params.end_date   = endDate;

      const res = await reportApi.marketVsOwnReport(params);
      setData(res.data?.data ?? null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load market vs own report");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const comp = data?.comparison ?? {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Market vs Own Vehicle Report</h2>
        <button onClick={fetchReport} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

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

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="h-4 bg-slate-800 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : data ? (
        <>
          {/* Side-by-side comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            <ComparisonCard
              title="Own Vehicles (Personal)"
              icon={HiOutlineTruck}
              color="amber"
              data={data.own_vehicles}
            />
            <ComparisonCard
              title="Market Vehicles (Partner)"
              icon={HiOutlineUsers}
              color="blue"
              data={data.market_vehicles}
            />
          </div>

          {/* Combined comparison summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <HiOutlineTrendingUp className="w-4 h-4 text-amber-500" />
              Combined Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Total Rides</p>
                <p className="text-lg font-bold text-white">{comp.combined_total_rides ?? 0}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Combined Revenue</p>
                <p className="text-lg font-bold text-amber-400 font-mono">Rs {formatAmount(comp.combined_total_revenue)}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Combined Profit</p>
                <p className={`text-lg font-bold font-mono ${profitColor(comp.combined_profit)}`}>Rs {formatAmount(comp.combined_profit)}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Profit Difference</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className={`text-lg font-bold font-mono ${profitColor(comp.profit_difference)}`}>
                    Rs {formatAmount(comp.profit_difference)}
                  </span>
                </div>
                <p className="text-xs mt-1">
                  {comp.own_more_profitable
                    ? <span className="text-emerald-400">Own more profitable</span>
                    : <span className="text-blue-400">Market more profitable</span>
                  }
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}