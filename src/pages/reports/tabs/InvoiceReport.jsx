import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineRefresh,
  HiOutlineDocumentText,
  HiOutlineCurrencyDollar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import reportApi from "../../../api/reportApi";
import partyApi from "../../../api/partyApi";
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

export default function InvoiceReport() {
  const [data, setData]           = useState(null);
  const [parties, setParties]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState(INIT_PAGINATION);
  const [showPending, setShowPending] = useState(false);

  // Filters
  const [startDate, setStartDate]       = useState("");
  const [endDate, setEndDate]           = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [partyId, setPartyId]           = useState("");

  useEffect(() => {
    partyApi.getAll({ per_page: 200 }).then((res) => setParties(res.data?.data?.parties || res.data?.data?.data || res.data?.data || [])).catch(() => {});
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 15 };
      if (startDate)      params.start_date      = startDate;
      if (endDate)        params.end_date        = endDate;
      if (paymentStatus)  params.payment_status  = paymentStatus;
      if (partyId)        params.party_id        = partyId;

      const res = await reportApi.invoiceReport(params);
      const d   = res.data?.data ?? {};
      setData(d);
      setPagination(d.pagination ?? INIT_PAGINATION);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load invoice report");
    } finally {
      setLoading(false);
    }
  }, [page, startDate, endDate, paymentStatus, partyId]);

  useEffect(() => { fetchReport(); }, [fetchReport]);
  useEffect(() => { setPage(1); }, [startDate, endDate, paymentStatus, partyId]);

  const summary       = data?.summary       ?? {};
  const clientPending = data?.client_pending ?? [];
  const invoices      = data?.invoices       ?? [];

  const pageNumbers = Array.from({ length: pagination.last_page }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === pagination.last_page || Math.abs(p - page) <= 1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Invoice Report</h2>
        <button onClick={fetchReport} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard label="Total Invoices" value={loading ? "—" : summary.total_invoices ?? 0}              icon={HiOutlineDocumentText}  color="blue" />
        <StatCard label="Total Amount"   value={loading ? "—" : `Rs ${formatAmount(summary.total_amount)}`}     icon={HiOutlineCurrencyDollar} color="amber" />
        <StatCard label="Paid Amount"    value={loading ? "—" : `Rs ${formatAmount(summary.total_paid_amount)}`} icon={HiOutlineCheckCircle}    color="green"
          subLabel={`${loading ? "" : summary.paid_invoices ?? 0} invoices`} />
        <StatCard label="Outstanding"    value={loading ? "—" : `Rs ${formatAmount(summary.outstanding_balance)}`} icon={HiOutlineClock}         color="red"
          subLabel={`${loading ? "" : summary.unpaid_invoices ?? 0} invoices`} />
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
            <label className="block text-xs text-slate-500 mb-1">Status</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none">
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
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
        </div>
        {(startDate || endDate || paymentStatus || partyId) && (
          <div className="mt-3">
            <button onClick={() => { setStartDate(""); setEndDate(""); setPaymentStatus(""); setPartyId(""); }}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 text-xs hover:bg-slate-800 hover:text-white transition-colors">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Client Pending Toggle */}
      {clientPending.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowPending((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/40 transition-colors text-left"
          >
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <HiOutlineClock className="w-4 h-4 text-red-400" />
              Client-wise Outstanding
            </span>
            <span className="text-xs text-slate-500">{showPending ? "Hide" : `Show ${clientPending.length} clients`}</span>
          </button>
          {showPending && (
            <div className="border-t border-slate-800 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/30">
                    <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Client</th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Phone</th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Pending Invoices</th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {clientPending.map((c) => (
                    <tr key={c.party_id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3 text-white font-medium">{c.party_name}</td>
                      <td className="px-5 py-3 text-slate-400">{c.party_phone || "—"}</td>
                      <td className="px-5 py-3 text-right text-slate-300">{c.pending_invoices}</td>
                      <td className="px-5 py-3 text-right text-red-400 font-mono font-semibold">Rs {formatAmount(c.pending_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invoice List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300">Invoice List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {["Invoice #", "Date", "Party", "Ride", "Amount", "Status"].map((h) => (
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
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">No invoices found.</td></tr>
              ) : invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 text-amber-400 font-medium">{inv.invoice_number}</td>
                  <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{fmtDate(inv.invoice_date)}</td>
                  <td className="px-5 py-3.5 text-slate-300">{inv.party?.name || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{inv.ride?.ride_number || "—"}</td>
                  <td className="px-5 py-3.5 text-right text-amber-400 font-mono">Rs {formatAmount(inv.amount)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                      inv.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${inv.payment_status === "paid" ? "bg-emerald-400" : "bg-red-400"}`} />
                      {inv.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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