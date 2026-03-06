import { useState, useEffect, useCallback, useRef } from "react";
import invoiceApi from "../../api/invoiceApi";
import toast from "react-hot-toast";
import {
  HiOutlineSearch,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineRefresh,
  HiOutlineEye,
  HiOutlineDocumentText,
  HiOutlineX,
  HiOutlineDownload,
  HiOutlineCash,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";

// ─── Helpers ─────────────────────────────────────────────────
function formatAmount(val) {
  const num = Number(val);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// ─── Stats Card ──────────────────────────────────────────────
function StatCard({ label, value, color }) {
  const colors = {
    total: "text-blue-400",
    paid: "text-emerald-400",
    unpaid: "text-red-400",
    amount: "text-amber-400",
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color] || "text-white"}`}>{value}</p>
    </div>
  );
}

// ─── Edit Invoice Modal ──────────────────────────────────────
function EditInvoiceModal({ open, onClose, onSave, invoice }) {
  const [form, setForm] = useState({
    invoice_number: "",
    invoice_date: "",
    invoice_type: "balance",
    amount: "",
    payment_status: "unpaid",
    payment_date: "",
    description: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && invoice) {
      setForm({
        invoice_number: invoice.invoice_number || "",
        invoice_date: invoice.invoice_date ? invoice.invoice_date.split("T")[0] : "",
        invoice_type: invoice.invoice_type || "balance",
        amount: invoice.amount || "",
        payment_status: invoice.payment_status || "unpaid",
        payment_date: invoice.payment_date ? invoice.payment_date.split("T")[0] : "",
        description: invoice.description || "",
        notes: invoice.notes || "",
      });
      setErrors({});
    }
  }, [open, invoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "payment_status" && value === "unpaid") updated.payment_date = "";
      if (name === "payment_status" && value === "paid" && !prev.payment_date) {
        updated.payment_date = new Date().toISOString().split("T")[0];
      }
      return updated;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = {
        invoice_number: form.invoice_number,
        invoice_date: form.invoice_date,
        invoice_type: form.invoice_type,
        amount: Number(form.amount),
        payment_status: form.payment_status,
        payment_date: form.payment_status === "paid" ? (form.payment_date || new Date().toISOString().split("T")[0]) : null,
        description: form.description || null,
        notes: form.notes || null,
      };
      await invoiceApi.update(invoice.id, payload);
      toast.success("Invoice updated successfully");
      onSave();
      onClose();
    } catch (err) {
      const res = err.response;
      if (res?.status === 400 && res.data?.errors) setErrors(res.data.errors);
      else toast.error(res?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 flex items-center justify-between px-6 py-4 border-b border-slate-800 z-10">
          <h3 className="text-lg font-semibold text-white">Edit Invoice</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Invoice Number */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Invoice Number <span className="text-red-400">*</span></label>
            <input type="text" name="invoice_number" value={form.invoice_number} onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 ${errors.invoice_number ? "border-red-500 focus:ring-red-500/30" : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"}`}
            />
            {errors.invoice_number && <p className="text-red-400 text-xs mt-1">{Array.isArray(errors.invoice_number) ? errors.invoice_number[0] : errors.invoice_number}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Invoice Date</label>
              <input type="date" name="invoice_date" value={form.invoice_date} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Type</label>
              <select name="invoice_type" value={form.invoice_type} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500">
                <option value="advance">Advance</option>
                <option value="balance">Balance</option>
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Amount <span className="text-red-400">*</span></label>
            <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" min="0" step="0.01"
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 ${errors.amount ? "border-red-500 focus:ring-red-500/30" : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"}`}
            />
            {errors.amount && <p className="text-red-400 text-xs mt-1">{Array.isArray(errors.amount) ? errors.amount[0] : errors.amount}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Payment Status</label>
              <select name="payment_status" value={form.payment_status} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500">
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            {form.payment_status === "paid" && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Payment Date</label>
                <input type="date" name="payment_date" value={form.payment_date} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label>
            <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="Payment description"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Optional notes..."
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-900 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />}
              Update Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Invoice Modal ────────────────────────────────────
function DeleteInvoiceModal({ open, onClose, onConfirm, invoice, deleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineTrash className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Delete Invoice</h3>
        <p className="text-slate-400 text-sm mt-2">
          Are you sure you want to delete{" "}
          <span className="text-white font-medium">{invoice?.invoice_number}</span>
          {" "}(Rs {formatAmount(invoice?.amount)})?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 disabled:bg-red-500/50 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            {deleting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Invoice View Modal ──────────────────────────────────────
function InvoiceViewModal({ open, onClose, invoiceId, onMarkPaid, onEdit, onDelete }) {
  const [invoice, setInvoice] = useState(null);
  const [rideData, setRideData] = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (!open || !invoiceId) {
      setInvoice(null);
      setRideData(null);
      return;
    }
    setLoading(true);
    invoiceApi
      .getById(invoiceId)
      .then(async (res) => {
        const inv = res.data.data;
        setInvoice(inv);
        // Also fetch ride details to get expenses + financial summary
        if (inv?.ride_id) {
          try {
            const rideRes = await rideApi.getById(inv.ride_id);
            setRideData(rideRes.data.data);
          } catch {
            // non-fatal — ride data is supplementary
          }
        }
      })
      .catch(() => toast.error("Failed to load invoice"))
      .finally(() => setLoading(false));
  }, [open, invoiceId]);

  // ── Derived financials from ride data ──────────────────────
  const bookingAmount    = Number(rideData?.ride?.booking_amount ?? 0);
  const allExpenses      = rideData?.expenses ?? [];
  const partyExpenses    = allExpenses.filter((e) => e.expense_type === "party");
  const partyTotal       = partyExpenses.reduce((s, e) => s + Number(e.expense_amount), 0);
  const totalBillable    = bookingAmount + partyTotal;
  const totalPaid        = Number(rideData?.invoice_summary?.total_paid ?? 0);
  const balanceDue       = totalBillable - totalPaid;

  // ── Print handler ───────────────────────────────────────────
  const handleDownloadPdf = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Billing Invoice ${invoice?.invoice_number || ""}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: #fff; color: #000; padding: 30px 40px; font-size: 13px; }
          .inv-wrapper { max-width: 780px; margin: 0 auto; border: 1px solid #ccc; }
          .inv-title-block { text-align: center; padding: 10px 0 4px; border-bottom: 1px solid #ccc; }
          .inv-title-block .billing-invoice { font-size: 15px; font-weight: bold; letter-spacing: 1px; }
          .inv-title-block .company-name { font-size: 16px; font-weight: bold; letter-spacing: 1px; margin-top: 2px; }
          .amber-banner { background: #f59e0b; color: #000; text-align: center; font-weight: bold; font-size: 12px; padding: 5px 10px; }
          .contact-block { padding: 6px 12px; border-bottom: 1px solid #ccc; }
          .contact-block .owner { font-weight: bold; font-size: 13px; }
          .contact-block .cell { font-size: 12px; margin-top: 2px; }
          .contact-block .cell span { font-weight: bold; margin-right: 6px; }
          .meta-row { display: flex; align-items: flex-end; justify-content: space-between; padding: 8px 12px; border-bottom: 2px solid #f59e0b; gap: 12px; }
          .meta-row .party-block { flex: 1; }
          .meta-row .party-block label { font-weight: bold; font-size: 13px; margin-right: 8px; }
          .meta-row .party-block .underline-val { display: inline-block; min-width: 200px; border-bottom: 1.5px solid #000; font-size: 13px; padding-bottom: 1px; }
          .meta-row .right-block { display: flex; flex-direction: column; gap: 5px; align-items: flex-end; }
          .meta-row .right-block .field-line { display: flex; align-items: flex-end; gap: 6px; }
          .meta-row .right-block .field-line label { font-weight: bold; font-size: 12px; white-space: nowrap; }
          .meta-row .right-block .field-line .underline-val { display: inline-block; min-width: 130px; border-bottom: 1.5px solid #000; font-size: 12px; padding-bottom: 1px; text-align: left; }
          .inv-table { width: 100%; border-collapse: collapse; }
          .inv-table th { background: #fff; border: 1px solid #bbb; padding: 6px 8px; font-weight: bold; font-size: 12px; text-align: center; }
          .inv-table td { border: 1px solid #bbb; padding: 5px 8px; font-size: 12px; text-align: center; height: 22px; }
          .inv-table td.left-td { text-align: left; }
          .inv-table td.right-td { text-align: right; }
          .inv-table .grand-row td { font-weight: bold; font-size: 13px; background: #fafafa; }
          .inv-footer { background: #f59e0b; color: #000; text-align: center; font-size: 10.5px; font-weight: bold; padding: 5px 10px; }
          @media print { body { padding: 10px; } .inv-wrapper { border: none; } }
        </style>
      </head>
      <body>
        ${printRef.current.innerHTML}
        <script>window.onload = function() { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `);
    win.document.close();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col">

        {/* ── Modal Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <h3 className="text-base font-semibold text-white">Invoice Details</h3>
          <div className="flex items-center gap-2">
            {invoice?.payment_status === "unpaid" && (
              <button
                onClick={() => { onClose(); onMarkPaid(invoice); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                Mark Paid
              </button>
            )}
            {invoice && (
              <button
                onClick={() => { onClose(); onEdit(invoice); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                ✏ Edit
              </button>
            )}
            {invoice && (
              <button
                onClick={() => { onClose(); onDelete(invoice); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg text-xs transition-colors"
              >
                🗑 Delete
              </button>
            )}
            {invoice && (
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-xs transition-colors"
              >
                ⬇ Print / PDF
              </button>
            )}
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors ml-1">✕</button>
          </div>
        </div>

        {/* ── Scrollable body ──────────────────────────────── */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-16 flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : invoice ? (
            <div className="p-6 space-y-5">

              {/* ── Company + Invoice # banner ─────────────── */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {/* Amber top stripe */}
                <div className="h-1 bg-amber-500 w-full" />
                <div className="flex items-start justify-between p-5">
                  {/* Left: company */}
                  <div>
                    <h2 className="text-amber-500 font-bold text-xl tracking-wide">ILAYS&SONS</h2>
                    <p className="text-slate-500 text-xs uppercase tracking-widest mt-0.5">Transport</p>
                    <p className="text-slate-600 text-xs mt-1">Truck & Trailer Supplier · Container Service</p>
                  </div>
                  {/* Right: invoice badge */}
                  <div className="text-right">
                    <p className="text-2xl font-black text-white tracking-tight">INVOICE</p>
                    <p className="text-slate-400 text-sm font-mono mt-0.5">{invoice.invoice_number}</p>
                    <span
                      className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        invoice.payment_status === "paid"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/15 text-red-400 border border-red-500/30"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${invoice.payment_status === "paid" ? "bg-emerald-400" : "bg-red-400"}`} />
                      {invoice.payment_status === "paid" ? "PAID" : "UNPAID"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Party + Ride row ───────────────────────── */}
              <div className="grid grid-cols-2 gap-4">
                {/* Party */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Billed To</p>
                  <p className="text-white font-semibold text-sm">{invoice.party?.name || "—"}</p>
                  {invoice.party?.phone && (
                    <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                      <span className="text-slate-600">📞</span> {invoice.party.phone}
                    </p>
                  )}
                  {invoice.party?.email && (
                    <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                      <span className="text-slate-600">✉</span> {invoice.party.email}
                    </p>
                  )}
                </div>

                {/* Ride */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Ride Details</p>
                  <p className="text-white font-semibold text-sm">{invoice.ride?.ride_number || "—"}</p>
                  {invoice.ride?.start_date && (
                    <p className="text-slate-400 text-xs mt-1">{formatDate(invoice.ride.start_date)}</p>
                  )}
                  {rideData?.ride?.route && (
                    <p className="text-slate-500 text-xs mt-0.5 truncate">📍 {rideData.ride.route}</p>
                  )}
                  {rideData?.ride?.container_no && (
                    <p className="text-slate-500 text-xs mt-0.5">📦 {rideData.ride.container_no}</p>
                  )}
                </div>
              </div>

              {/* ── Invoice meta row ───────────────────────── */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Invoice Date</p>
                  <p className="text-white text-sm font-medium">{formatDate(invoice.invoice_date)}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Type</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    invoice.invoice_type === "advance"
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                  }`}>
                    {invoice.invoice_type}
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Invoice Amount</p>
                  <p className="text-amber-400 text-sm font-bold">
                    Rs {formatAmount(invoice.amount)}
                  </p>
                </div>
              </div>

              {/* ── Financial breakdown (from ride) ───────── */}
              {rideData && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <p className="text-sm font-semibold text-white">Ride Financial Summary</p>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Booking Amount</span>
                      <span className="text-white font-medium">Rs {formatAmount(bookingAmount)}</span>
                    </div>
                    {partyTotal > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 flex items-center gap-1">
                          <span className="text-amber-400 font-bold">+</span> Party Expenses
                        </span>
                        <span className="text-amber-400 font-medium">Rs {formatAmount(partyTotal)}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm">
                      <span className="text-slate-300 font-semibold">Total Billable</span>
                      <span className="text-white font-bold">Rs {formatAmount(totalBillable)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 flex items-center gap-1">
                        <span className="text-emerald-400 font-bold">−</span> Total Paid
                      </span>
                      <span className="text-emerald-400 font-medium">Rs {formatAmount(totalPaid)}</span>
                    </div>
                    <div className={`flex justify-between items-center text-sm pt-1 border-t border-slate-800 ${balanceDue > 0 ? "text-red-400" : "text-emerald-400"}`}>
                      <span className="font-semibold">Balance Due</span>
                      <span className="font-bold">Rs {formatAmount(balanceDue)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Party expenses table ──────────────────── */}
              {partyExpenses.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <p className="text-sm font-semibold text-white">Party Expenses</p>
                      <span className="text-xs text-slate-500">({partyExpenses.length})</span>
                    </div>
                    <span className="text-xs font-semibold text-amber-400">
                      Rs {formatAmount(partyTotal)}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {partyExpenses.map((exp) => (
                      <div key={exp.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-slate-300 text-sm">{exp.expense_description || exp.description || "—"}</p>
                          {exp.expense_date && (
                            <p className="text-slate-600 text-xs mt-0.5">{formatDate(exp.expense_date)}</p>
                          )}
                        </div>
                        <span className="text-amber-400 text-sm font-semibold">
                          Rs {formatAmount(exp.expense_amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Payment info ──────────────────────────── */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">This Invoice Amount</p>
                    <p className="text-2xl font-black text-amber-500 mt-0.5">
                      Rs {formatAmount(invoice.amount)}
                    </p>
                  </div>
                  {invoice.payment_status === "paid" && invoice.payment_date && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Paid On</p>
                      <p className="text-emerald-400 text-sm font-semibold mt-0.5">{formatDate(invoice.payment_date)}</p>
                    </div>
                  )}
                  {invoice.payment_status === "unpaid" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-full">
                      ⚠ Awaiting Payment
                    </span>
                  )}
                </div>
              </div>

              {/* ── Description / Notes ───────────────────── */}
              {(invoice.description || invoice.notes) && (
                <div className="space-y-3">
                  {invoice.description && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">Description</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{invoice.description}</p>
                    </div>
                  )}
                  {invoice.notes && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">Notes</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{invoice.notes}</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">Invoice not found.</div>
          )}
        </div>

        {/* ── Hidden print template ─────────────────────────── */}
        <div ref={printRef} style={{ display: "none" }}>
          {invoice && (
            <div className="inv-wrapper">
              <div className="inv-title-block">
                <div className="billing-invoice">BILLING INVOICE</div>
                <div className="company-name">ILAYS&SONS TRANSPORT</div>
              </div>
              <div className="amber-banner">TRUCK&amp;TRAILER SUPPLIER SPECIALIST IN CONTAINER SERVICE</div>
              <div className="contact-block">
                <div className="owner">KASHIF MARFANI</div>
                <div className="cell"><span>CELL#</span>923490953127</div>
              </div>
              <div className="meta-row">
                <div className="party-block">
                  <label>PARTY NAME</label>
                  <span className="underline-val">{invoice.party?.name ?? ""}</span>
                </div>
                <div className="right-block">
                  <div className="field-line">
                    <label>DATE</label>
                    <span className="underline-val">
                      {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString("en-GB") : ""}
                    </span>
                  </div>
                  <div className="field-line">
                    <label>BILL#</label>
                    <span className="underline-val">{invoice.invoice_number ?? ""}</span>
                  </div>
                </div>
              </div>
              <table className="inv-table">
                <thead>
                  <tr>
                    <th style={{ width: "90px" }}>DATE</th>
                    <th style={{ width: "50px" }}>QTY</th>
                    <th>PARTICULER</th>
                    <th style={{ width: "80px" }}>RATE</th>
                    <th style={{ width: "70px" }}>DETAIN</th>
                    <th style={{ width: "90px" }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString("en-GB") : ""}</td>
                    <td>1</td>
                    <td className="left-td">{invoice.description || (invoice.ride?.ride_number ? `Ride ${invoice.ride.ride_number}` : invoice.invoice_type)}</td>
                    <td className="right-td">{Number(invoice.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td></td>
                    <td className="right-td">{Number(invoice.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  {Array.from({ length: 17 }).map((_, i) => (
                    <tr key={i}><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                  ))}
                  <tr className="grand-row">
                    <td colSpan={5} className="left-td" style={{ paddingLeft: "12px" }}>GRAND TOTAL</td>
                    <td className="right-td">{Number(invoice.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
              <div className="inv-footer">OFFICE#07 GROUND FLOOR KULSOOM MEHAL BUILDING KHARADAR PUNJABI CLUB KARACHI</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Mark as Paid Modal ──────────────────────────────────────
function MarkPaidModal({ open, onClose, onConfirm, invoice, marking }) {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (open) setPaymentDate(new Date().toISOString().split("T")[0]);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineCash className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white text-center">Mark as Paid</h3>
        <p className="text-slate-400 text-sm mt-2 text-center">
          Mark <span className="text-white font-medium">{invoice?.invoice_number}</span> (Rs {formatAmount(invoice?.amount)}) as paid?
        </p>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Payment Date</label>
          <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={() => onConfirm({ payment_date: paymentDate })} disabled={marking} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            {marking && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Confirm Paid
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main InvoicesPage ───────────────────────────────────────
export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  // View modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState(null);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Mark paid modal
  const [markPaidModalOpen, setMarkPaidModalOpen] = useState(false);
  const [markPaidTarget, setMarkPaidTarget] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      if (statusFilter) params.payment_status = statusFilter;
      if (typeFilter) params.invoice_type = typeFilter;

      const res = await invoiceApi.getAll(params);
      const data = res.data.data;
      setInvoices(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
        from: data.from,
        to: data.to,
      });
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await invoiceApi.statistics();
      setStats(res.data.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPage(1); }, [search, statusFilter, typeFilter]);

  const refreshAll = () => { fetchInvoices(); fetchStats(); };

  // Mark paid
  const handleMarkPaidConfirm = async (payload) => {
    if (!markPaidTarget) return;
    setMarkingPaid(true);
    try {
      await invoiceApi.markAsPaid(markPaidTarget.id, payload);
      toast.success("Invoice marked as paid");
      setMarkPaidModalOpen(false);
      setMarkPaidTarget(null);
      refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark as paid");
    } finally {
      setMarkingPaid(false);
    }
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await invoiceApi.delete(deleteTarget.id);
      toast.success("Invoice deleted successfully");
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete invoice");
    } finally {
      setDeleting(false);
    }
  };

  // Handlers from view modal
  const handleMarkPaidFromView = (invoice) => { setMarkPaidTarget(invoice); setMarkPaidModalOpen(true); };
  const handleEditFromView = (invoice) => { setEditTarget(invoice); setEditModalOpen(true); };
  const handleDeleteFromView = (invoice) => { setDeleteTarget(invoice); setDeleteModalOpen(true); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Invoice Management</h1>
        <p className="text-slate-500 text-sm mt-0.5">View and manage all invoices</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Invoices" value={stats.overall?.total_invoices ?? 0} color="total" />
          <StatCard label="Total Amount" value={`Rs ${formatAmount(stats.overall?.total_amount ?? 0)}`} color="amount" />
          <StatCard label="Paid" value={`Rs ${formatAmount(stats.overall?.total_paid ?? 0)}`} color="paid" />
          <StatCard label="Unpaid" value={`Rs ${formatAmount(stats.overall?.total_unpaid ?? 0)}`} color="unpaid" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by invoice number..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500">
          <option value="">All Types</option>
          <option value="advance">Advance</option>
          <option value="balance">Balance</option>
        </select>
        <button onClick={refreshAll} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Refresh">
          <HiOutlineRefresh className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ride</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Party</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm mt-3">Loading invoices...</p>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <HiOutlineDocumentText className="w-10 h-10 text-slate-700 mx-auto" />
                    <p className="text-slate-500 text-sm mt-3">No invoices found</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-white whitespace-nowrap">{inv.invoice_number}</td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{formatDate(inv.invoice_date)}</td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{inv.ride?.ride_number || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{inv.party?.name || "—"}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${inv.invoice_type === "advance" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>
                        {inv.invoice_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-white whitespace-nowrap text-right font-medium">Rs {formatAmount(inv.amount)}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${inv.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${inv.payment_status === "paid" ? "bg-emerald-400" : "bg-red-400"}`} />
                        {inv.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setViewInvoiceId(inv.id); setViewModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="View"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditTarget(inv); setEditModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        {inv.payment_status === "unpaid" && (
                          <button
                            onClick={() => { setMarkPaidTarget(inv); setMarkPaidModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Mark as Paid"
                          >
                            <HiOutlineCash className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => { setDeleteTarget(inv); setDeleteModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <p className="text-xs text-slate-500">Showing {pagination.from || 0}–{pagination.to || 0} of {pagination.total}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors">
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.last_page || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showDots = prev && p - prev > 1;
                  return (
                    <span key={p} className="flex items-center">
                      {showDots && <span className="px-1 text-slate-600 text-xs">…</span>}
                      <button onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-amber-500 text-slate-900" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                        {p}
                      </button>
                    </span>
                  );
                })}
              <button onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))} disabled={page >= pagination.last_page} className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors">
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <InvoiceViewModal
        open={viewModalOpen}
        onClose={() => { setViewModalOpen(false); setViewInvoiceId(null); }}
        invoiceId={viewInvoiceId}
        onMarkPaid={handleMarkPaidFromView}
        onEdit={handleEditFromView}
        onDelete={handleDeleteFromView}
      />
      <EditInvoiceModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditTarget(null); }}
        onSave={refreshAll}
        invoice={editTarget}
      />
      <DeleteInvoiceModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
        invoice={deleteTarget}
        deleting={deleting}
      />
      <MarkPaidModal
        open={markPaidModalOpen}
        onClose={() => { setMarkPaidModalOpen(false); setMarkPaidTarget(null); }}
        onConfirm={handleMarkPaidConfirm}
        invoice={markPaidTarget}
        marking={markingPaid}
      />
    </div>
  );
}