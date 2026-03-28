import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineRefresh,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import reportApi from "../../../api/reportApi";
import partyApi from "../../../api/partyApi";
import StatCard from "../components/StatCard";

const formatAmount = (val) => {
  const num = parseFloat(val) || 0;
  return num.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const profitColor = (val) =>
  parseFloat(val) >= 0 ? "text-emerald-400" : "text-red-400";

export default function PartyReport() {
  const [data, setData]       = useState(null);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [partyId, setPartyId]     = useState("");

  useEffect(() => {
    partyApi.getAll({ per_page: 200 }).then((res) => setParties(res.data?.data?.parties || res.data?.data?.data || res.data?.data || [])).catch(() => {});
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate)   params.end_date   = endDate;
      if (partyId)   params.party_id   = partyId;

      const res = await reportApi.partyReport(params);
      setData(res.data?.data ?? null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load party report");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, partyId]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const rows   = data?.parties ?? [];
  const totals = data?.totals  ?? {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Party / Client Report</h2>
        <button onClick={fetchReport} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard label="Total Parties"  value={totals.total_parties ?? 0}                        icon={HiOutlineUserGroup}     color="blue" />
          <StatCard label="Total Billed"   value={`Rs ${formatAmount(totals.total_billed)}`}        icon={HiOutlineCurrencyDollar} color="amber" />
          <StatCard label="Total Paid"     value={`Rs ${formatAmount(totals.total_paid)}`}          icon={HiOutlineDocumentText}  color="green" />
          <StatCard label="Total Unpaid"   value={`Rs ${formatAmount(totals.total_unpaid)}`}        icon={HiOutlineCurrencyDollar} color="red" />
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
            <label className="block text-xs text-slate-500 mb-1">Party</label>
            <select value={partyId} onChange={(e) => setPartyId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none">
              <option value="">All Parties</option>
              {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {(startDate || endDate || partyId) && (
            <div className="flex items-end">
              <button onClick={() => { setStartDate(""); setEndDate(""); setPartyId(""); }}
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
                {["Party", "Contact", "Rides", "Total Billed", "Paid", "Unpaid", "Invoices", "Profit"].map((h) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                    ["Total Billed", "Paid", "Unpaid", "Profit"].includes(h) ? "text-right" : "text-left"
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
                <tr><td colSpan={8} className="text-center py-12 text-slate-500">No party data found.</td></tr>
              ) : rows.map((p) => {
                const inv = p.invoice_summary || {};
                return (
                  <tr key={p.party_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-white font-medium">{p.party_name}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-300 text-xs">{p.party_phone || "—"}</div>
                      <div className="text-slate-500 text-xs">{p.party_email || ""}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{p.total_rides}</td>
                    <td className="px-5 py-3.5 text-right text-amber-400 font-mono">Rs {formatAmount(p.total_billed)}</td>
                    <td className="px-5 py-3.5 text-right text-emerald-400 font-mono">Rs {formatAmount(inv.total_paid)}</td>
                    <td className="px-5 py-3.5 text-right text-red-400 font-mono">Rs {formatAmount(inv.total_unpaid)}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-xs">
                        <span className="text-slate-300">{inv.total_invoices ?? 0} total</span>
                        <span className="text-slate-600 mx-1">·</span>
                        <span className="text-emerald-400">{inv.paid_invoices ?? 0} paid</span>
                        <span className="text-slate-600 mx-1">·</span>
                        <span className="text-red-400">{inv.unpaid_invoices ?? 0} unpaid</span>
                      </div>
                    </td>
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
                  <td colSpan={3} className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Totals ({totals.total_parties} parties)
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-amber-400 font-mono">Rs {formatAmount(totals.total_billed)}</td>
                  <td className="px-5 py-3 text-right font-bold text-emerald-400 font-mono">Rs {formatAmount(totals.total_paid)}</td>
                  <td className="px-5 py-3 text-right font-bold text-red-400 font-mono">Rs {formatAmount(totals.total_unpaid)}</td>
                  <td className="px-5 py-3" />
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