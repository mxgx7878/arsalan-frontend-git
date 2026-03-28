import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineRefresh,
  HiOutlineUsers,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineMap,
} from "react-icons/hi";
import reportApi from "../../../api/reportApi";
import partnerApi from "../../../api/partnerApi";
import StatCard from "../components/StatCard";

const formatAmount = (val) => {
  const num = parseFloat(val) || 0;
  return num.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const profitColor = (val) =>
  parseFloat(val) >= 0 ? "text-emerald-400" : "text-red-400";

export default function PartnerReport() {
  const [data, setData]         = useState(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading]   = useState(false);

  // Filters
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [partnerId, setPartnerId]   = useState("");

  useEffect(() => {
    partnerApi.getAll({ per_page: 200 }).then((res) => setPartners(res.data?.data?.partners || res.data?.partners || [])).catch(() => {});
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate)  params.start_date  = startDate;
      if (endDate)    params.end_date    = endDate;
      if (partnerId)  params.partner_id  = partnerId;

      const res = await reportApi.partnerReport(params);
      setData(res.data?.data ?? null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load partner report");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, partnerId]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const rows   = data?.partners ?? [];
  const totals = data?.totals   ?? {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Partner / Driver Report</h2>
        <button onClick={fetchReport} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard label="Total Partners"  value={totals.total_partners ?? 0}                         icon={HiOutlineUsers}          color="blue" />
          <StatCard label="Total Revenue"   value={`Rs ${formatAmount(totals.total_revenue)}`}         icon={HiOutlineCurrencyDollar} color="amber" />
          <StatCard label="Total Payments"  value={`Rs ${formatAmount(totals.total_payments)}`}        icon={HiOutlineCurrencyDollar} color="purple" />
          <StatCard label="Total Profit"    value={`Rs ${formatAmount(totals.total_profit)}`}          icon={HiOutlineTrendingUp}     color={parseFloat(totals.total_profit) >= 0 ? "green" : "red"} />
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
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Partner</label>
            <select value={partnerId} onChange={(e) => setPartnerId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none">
              <option value="">All Partners</option>
              {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {(startDate || endDate || partnerId) && (
            <div className="flex items-end">
              <button onClick={() => { setStartDate(""); setEndDate(""); setPartnerId(""); }}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 hover:text-white transition-colors">
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
                {["Partner", "Status", "Rides", "Revenue", "Payments Made", "Personal Exp.", "Party Exp.", "Profit"].map((h) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                    ["Revenue", "Payments Made", "Personal Exp.", "Party Exp.", "Profit"].includes(h) ? "text-right" : "text-left"
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-500">No partner data found.</td></tr>
              ) : rows.map((p) => {
                const exp = p.expense_summary || {};
                return (
                  <tr key={p.partner_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-white font-medium">{p.partner_name}</div>
                      <div className="text-slate-500 text-xs">{p.partner_phone || ""}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{p.total_rides}</td>
                    <td className="px-5 py-3.5 text-right text-amber-400 font-mono">Rs {formatAmount(p.total_revenue)}</td>
                    <td className="px-5 py-3.5 text-right text-purple-400 font-mono">Rs {formatAmount(p.payments_made)}</td>
                    <td className="px-5 py-3.5 text-right text-red-400 font-mono">Rs {formatAmount(exp.personal_expenses)}</td>
                    <td className="px-5 py-3.5 text-right text-blue-400 font-mono">Rs {formatAmount(exp.party_expenses)}</td>
                    <td className={`px-5 py-3.5 text-right font-mono font-semibold ${profitColor(p.profit)}`}>
                      Rs {formatAmount(p.profit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {!loading && rows.length > 1 && (
              <tfoot>
                <tr className="border-t-2 border-slate-700 bg-slate-800/50">
                  <td colSpan={2} className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Totals ({totals.total_partners} partners)
                  </td>
                  <td className="px-5 py-3 text-left font-bold text-white">{totals.total_rides}</td>
                  <td className="px-5 py-3 text-right font-bold text-amber-400 font-mono">Rs {formatAmount(totals.total_revenue)}</td>
                  <td className="px-5 py-3 text-right font-bold text-purple-400 font-mono">Rs {formatAmount(totals.total_payments)}</td>
                  <td colSpan={2} />
                  <td className={`px-5 py-3 text-right font-bold font-mono ${profitColor(totals.total_profit)}`}>
                    Rs {formatAmount(totals.total_profit)}
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