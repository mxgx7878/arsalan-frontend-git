import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  HiOutlineRefresh,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineMap,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineExclamation,
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

export default function PendingDueReport() {
  const [data, setData]       = useState(null);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("invoices");

  // Filter
  const [partyId, setPartyId] = useState("");

  useEffect(() => {
    partyApi.getAll({ per_page: 200 }).then((res) => setParties(res.data?.data?.parties || res.data?.data?.data || res.data?.data || [])).catch(() => {});
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (partyId) params.party_id = partyId;
      const res = await reportApi.pendingDueReport(params);
      setData(res.data?.data ?? null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load pending & due report");
    } finally {
      setLoading(false);
    }
  }, [partyId]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const summary          = data?.summary            ?? {};
  const unpaidInvoices   = data?.unpaid_invoices    ?? [];
  const pendingRides     = data?.pending_rides      ?? [];
  const clientOutstanding = data?.client_outstanding ?? [];

  const sections = [
    { id: "invoices",    label: "Unpaid Invoices",     count: unpaidInvoices.length },
    { id: "rides",       label: "Pending Rides",       count: pendingRides.length },
    { id: "outstanding", label: "Client Outstanding",  count: clientOutstanding.length },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Pending & Due Report</h2>
        <button onClick={fetchReport} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <HiOutlineRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard label="Unpaid Invoices"    value={loading ? "—" : summary.total_unpaid_invoices ?? 0}          icon={HiOutlineDocumentText}  color="red" />
        <StatCard label="Outstanding Amount" value={loading ? "—" : `Rs ${formatAmount(summary.total_outstanding_amount)}`} icon={HiOutlineCurrencyDollar} color="red" />
        <StatCard label="Pending Rides"      value={loading ? "—" : summary.total_pending_rides ?? 0}            icon={HiOutlineMap}           color="amber" />
        <StatCard label="Clients with Dues"  value={loading ? "—" : summary.clients_with_dues ?? 0}             icon={HiOutlineUserGroup}     color="purple" />
      </div>

      {/* Alert banner if outstanding */}
      {!loading && parseFloat(summary.total_outstanding_amount) > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
          <HiOutlineExclamation className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Outstanding Balance Alert</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Total outstanding of <span className="text-red-300 font-semibold">Rs {formatAmount(summary.total_outstanding_amount)}</span> across{" "}
              {summary.clients_with_dues ?? 0} client(s) with {summary.total_unpaid_invoices ?? 0} unpaid invoice(s).
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 max-w-xs">
            <label className="block text-xs text-slate-500 mb-1">Filter by Party</label>
            <select value={partyId} onChange={(e) => setPartyId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none">
              <option value="">All Parties</option>
              {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {partyId && (
            <div className="flex items-end">
              <button onClick={() => setPartyId("")}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 hover:text-white transition-colors">
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-0">
        {sections.map((s) => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeSection === s.id
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}>
            {s.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeSection === s.id ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-500"
            }`}>
              {loading ? "…" : s.count}
            </span>
          </button>
        ))}
      </div>

      {/* Section: Unpaid Invoices */}
      {activeSection === "invoices" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Invoice #", "Invoice Date", "Party", "Ride #", "Amount"].map((h) => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-5 py-3.5"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>)}</tr>
                  ))
                ) : unpaidInvoices.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-emerald-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">✓</span>
                      No unpaid invoices!
                    </div>
                  </td></tr>
                ) : unpaidInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-amber-400 font-medium">{inv.invoice_number}</td>
                    <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{fmtDate(inv.invoice_date)}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-300">{inv.party?.name || "—"}</div>
                      <div className="text-slate-500 text-xs">{inv.party?.phone || ""}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{inv.ride?.ride_number || "—"}</td>
                    <td className="px-5 py-3.5 text-right text-red-400 font-mono font-semibold">Rs {formatAmount(inv.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section: Pending Rides */}
      {activeSection === "rides" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Ride #", "Start Date", "Route", "Party", "Vehicle", "Booking"].map((h) => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === "Booking" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-5 py-3.5"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>)}</tr>
                  ))
                ) : pendingRides.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-emerald-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">✓</span>
                      No pending rides!
                    </div>
                  </td></tr>
                ) : pendingRides.map((r) => (
                  <tr key={r.ride_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-amber-400 font-medium">{r.ride_number}</td>
                    <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{fmtDate(r.start_date)}</td>
                    <td className="px-5 py-3.5 text-slate-400 max-w-[120px] truncate" title={r.route}>{r.route || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-300">{r.party?.name || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-300">{r.vehicle?.vehicle_number || "—"}</td>
                    <td className="px-5 py-3.5 text-right text-amber-400 font-mono">Rs {formatAmount(r.booking_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section: Client Outstanding */}
      {activeSection === "outstanding" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Client", "Phone", "Oldest Invoice", "Pending Invoices", "Outstanding Amount"].map((h) => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                      ["Outstanding Amount", "Pending Invoices"].includes(h) ? "text-right" : "text-left"
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-5 py-3.5"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>)}</tr>
                  ))
                ) : clientOutstanding.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-emerald-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">✓</span>
                      No outstanding balances!
                    </div>
                  </td></tr>
                ) : clientOutstanding.map((c) => (
                  <tr key={c.party_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-white font-medium">{c.party_name}</td>
                    <td className="px-5 py-3.5 text-slate-400">{c.party_phone || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{fmtDate(c.oldest_invoice)}</td>
                    <td className="px-5 py-3.5 text-right text-slate-300">{c.pending_invoices}</td>
                    <td className="px-5 py-3.5 text-right text-red-400 font-mono font-bold text-base">
                      Rs {formatAmount(c.outstanding_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>

              {!loading && clientOutstanding.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-700 bg-slate-800/50">
                    <td colSpan={4} className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Total Outstanding
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-red-400 font-mono text-base">
                      Rs {formatAmount(summary.total_outstanding_amount)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}