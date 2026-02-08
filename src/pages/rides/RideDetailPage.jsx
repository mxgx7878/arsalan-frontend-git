import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import rideApi from "../../api/rideApi";
import rideExpenseApi from "../../api/rideExpenseApi";
import invoiceApi from "../../api/invoiceApi";
import toast from "react-hot-toast";
import {
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineTruck,
  HiOutlineUserGroup,
  HiOutlineUsers,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineBan,
  HiOutlineCash,
} from "react-icons/hi";

// ─── Helpers ─────────────────────────────────────────────────
function formatAmount(val) {
  const num = Number(val);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Expense Modal (Add / Edit) ──────────────────────────────
function ExpenseModal({ open, onClose, onSave, expense, rideId }) {
  const [form, setForm] = useState({ expense_amount: "", expense_note: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        expense_amount: expense.expense_amount || "",
        expense_note: expense.expense_note || "",
      });
    } else {
      setForm({ expense_amount: "", expense_note: "" });
    }
    setErrors({});
  }, [expense, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = {
        expense_amount: Number(form.expense_amount),
        expense_note: form.expense_note || null,
      };
      if (expense) {
        await rideExpenseApi.update(expense.id, payload);
        toast.success("Expense updated");
      } else {
        await rideExpenseApi.create(rideId, payload);
        toast.success("Expense added");
      }
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
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">
            {expense ? "Edit Expense" : "Add Expense"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Amount <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={form.expense_amount}
              onChange={(e) => setForm({ ...form, expense_amount: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 ${
                errors.expense_amount
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {errors.expense_amount && (
              <p className="text-red-400 text-xs mt-1">
                {Array.isArray(errors.expense_amount) ? errors.expense_amount[0] : errors.expense_amount}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Note</label>
            <textarea
              value={form.expense_note}
              onChange={(e) => setForm({ ...form, expense_note: e.target.value })}
              rows={3}
              placeholder="Fuel, toll, etc."
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-900 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />}
              {expense ? "Update" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Expense Modal ────────────────────────────────────
function DeleteExpenseModal({ open, onClose, onConfirm, deleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineTrash className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Delete Expense</h3>
        <p className="text-slate-400 text-sm mt-2">This action cannot be undone.</p>
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

// ─── Complete Ride Modal ─────────────────────────────────────
function CompleteModal({ open, onClose, onConfirm, completing }) {
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");

  useEffect(() => {
    if (open) { setPaymentReceived(false); setCompletionNotes(""); }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineCheckCircle className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white text-center">Complete Ride</h3>
        <p className="text-slate-400 text-sm mt-2 text-center">This will generate a balance invoice if any balance remains.</p>
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={paymentReceived} onChange={(e) => setPaymentReceived(e.target.checked)} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30" />
            <span className="text-sm text-slate-300">Balance payment received</span>
          </label>
          <textarea value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} rows={2} placeholder="Completion notes (optional)" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none" />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={() => onConfirm({ payment_received: paymentReceived, completion_notes: completionNotes })} disabled={completing} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            {completing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Invoice Modal (Create) ──────────────────────────────────
function InvoiceModal({ open, onClose, onSave, ride, balanceDue }) {
  const [form, setForm] = useState({
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0],
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
    if (open && ride) {
      const now = new Date();
      const autoNum = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(ride.id).padStart(5, "0")}-${Date.now().toString().slice(-4)}`;
      setForm({
        invoice_number: autoNum,
        invoice_date: now.toISOString().split("T")[0],
        invoice_type: "balance",
        amount: "",
        payment_status: "unpaid",
        payment_date: "",
        description: `Payment for ride ${ride.ride_number}`,
        notes: "",
      });
      setErrors({});
    }
  }, [open, ride]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "payment_status" && value === "unpaid") {
        updated.payment_date = "";
      }
      if (name === "payment_status" && value === "paid" && !prev.payment_date) {
        updated.payment_date = new Date().toISOString().split("T")[0];
      }
      return updated;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amt = Number(form.amount);
    if (amt <= 0) {
      setErrors({ amount: ["Amount must be greater than 0"] });
      return;
    }
    if (amt > Number(balanceDue)) {
      setErrors({ amount: [`Amount cannot exceed balance due (Rs ${formatAmount(balanceDue)})`] });
      return;
    }

    setSaving(true);
    setErrors({});
    try {
      const payload = {
        invoice_number: form.invoice_number,
        invoice_date: form.invoice_date,
        ride_id: ride.id,
        party_id: ride.party_id,
        invoice_type: form.invoice_type,
        amount: amt,
        payment_status: form.payment_status,
        payment_date: form.payment_status === "paid" ? (form.payment_date || new Date().toISOString().split("T")[0]) : null,
        description: form.description || null,
        notes: form.notes || null,
      };
      await invoiceApi.create(payload);
      toast.success("Invoice created successfully");
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
          <h3 className="text-lg font-semibold text-white">Create Invoice</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Balance info bar */}
        <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Maximum invoice amount (Balance Due)</span>
            <span className="text-red-400 font-bold">Rs {formatAmount(balanceDue)}</span>
          </div>
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
            {/* Invoice Date */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Invoice Date <span className="text-red-400">*</span></label>
              <input type="date" name="invoice_date" value={form.invoice_date} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
            {/* Invoice Type */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Type <span className="text-red-400">*</span></label>
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
            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Payment Status</label>
              <select name="payment_status" value={form.payment_status} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500">
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            {/* Payment Date (conditional) */}
            {form.payment_status === "paid" && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Payment Date</label>
                <input type="date" name="payment_date" value={form.payment_date} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label>
            <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="Payment description"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Notes */}
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
              Create Invoice
            </button>
          </div>
        </form>
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
          Mark invoice <span className="text-white font-medium">{invoice?.invoice_number}</span> (Rs {formatAmount(invoice?.amount)}) as paid?
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

// ─── Main RideDetailPage ─────────────────────────────────────
export default function RideDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Expense modals
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [deleteExpenseModalOpen, setDeleteExpenseModalOpen] = useState(false);
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(false);

  // Complete modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Invoice modals
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [markPaidModalOpen, setMarkPaidModalOpen] = useState(false);
  const [markPaidTarget, setMarkPaidTarget] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(false);

  const fetchRide = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rideApi.getById(id);
      setData(res.data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("Ride not found");
        navigate("/rides", { replace: true });
      } else {
        toast.error("Failed to load ride");
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchRide(); }, [fetchRide]);

  // Expense handlers
  const handleDeleteExpenseConfirm = async () => {
    if (!deleteExpenseTarget) return;
    setDeletingExpense(true);
    try {
      await rideExpenseApi.delete(deleteExpenseTarget.id);
      toast.success("Expense deleted");
      setDeleteExpenseModalOpen(false);
      setDeleteExpenseTarget(null);
      fetchRide();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete expense");
    } finally {
      setDeletingExpense(false);
    }
  };

  // Complete handler
  const handleComplete = async (payload) => {
    setCompleting(true);
    try {
      await rideApi.markAsCompleted(id, payload);
      toast.success("Ride completed successfully");
      setCompleteModalOpen(false);
      fetchRide();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete ride");
    } finally {
      setCompleting(false);
    }
  };

  // Invoice mark as paid handler
  const handleMarkPaidConfirm = async (payload) => {
    if (!markPaidTarget) return;
    setMarkingPaid(true);
    try {
      await invoiceApi.markAsPaid(markPaidTarget.id, payload);
      toast.success("Invoice marked as paid");
      setMarkPaidModalOpen(false);
      setMarkPaidTarget(null);
      fetchRide();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark as paid");
    } finally {
      setMarkingPaid(false);
    }
  };

  // Invoice add handler
  const handleAddInvoice = () => {
    const balance = Number(data?.financial_summary?.balance_amount ?? 0);
    if (balance <= 0) {
      toast.error("No balance due — cannot generate invoice");
      return;
    }
    setInvoiceModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { ride, invoices, invoice_summary, expenses, expense_summary, financial_summary } = data;
  const balanceDue = Number(financial_summary?.balance_amount ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/rides")} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">{ride.ride_number}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ride.is_completed ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ride.is_completed ? "bg-emerald-400" : "bg-amber-400"}`} />
                {ride.is_completed ? "Completed" : "Pending"}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">Ride details &amp; financials</p>
          </div>
        </div>
        {!ride.is_completed && (
          <button onClick={() => setCompleteModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg text-sm transition-colors">
            <HiOutlineCheckCircle className="w-4 h-4" />
            Mark Complete
          </button>
        )}
      </div>

      {/* Ride Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Basic Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <HiOutlineClipboardList className="w-4 h-4" /> Ride Info
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-slate-500 text-sm">Ride Number</span><span className="text-white text-sm font-medium">{ride.ride_number}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 text-sm">Start Date</span><span className="text-white text-sm">{formatDate(ride.start_date)}</span></div>
            {ride.completed_date && <div className="flex justify-between"><span className="text-slate-500 text-sm">Completed</span><span className="text-white text-sm">{formatDate(ride.completed_date)}</span></div>}
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Type</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ride.ride_type === "partner" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>{ride.ride_type}</span>
            </div>
            {ride.notes && <div className="pt-1"><span className="text-slate-500 text-xs">Notes</span><p className="text-slate-300 text-sm mt-0.5 whitespace-pre-wrap">{ride.notes}</p></div>}
          </div>
        </div>

        {/* Vehicle & Parties */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <HiOutlineTruck className="w-4 h-4" /> Vehicle & Parties
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-slate-500 text-xs">Vehicle</span>
              <p className="text-white text-sm font-medium mt-0.5">
                {ride.vehicle?.vehicle_number || "—"}
                {ride.vehicle?.type && <span className="text-slate-500 text-xs ml-2 capitalize">({ride.vehicle.type})</span>}
              </p>
            </div>
            <div>
              <span className="text-slate-500 text-xs flex items-center gap-1"><HiOutlineUserGroup className="w-3 h-3" /> Party</span>
              <p className="text-white text-sm font-medium mt-0.5">{ride.party?.name || "—"}</p>
              {ride.party?.phone && <p className="text-slate-500 text-xs">{ride.party.phone}</p>}
            </div>
            {ride.partner && (
              <div>
                <span className="text-slate-500 text-xs flex items-center gap-1"><HiOutlineUsers className="w-3 h-3" /> Partner</span>
                <p className="text-white text-sm font-medium mt-0.5">{ride.partner.name}</p>
                {ride.partner.phone && <p className="text-slate-500 text-xs">{ride.partner.phone}</p>}
              </div>
            )}
          </div>
        </div>

        {/* ─── Financial Summary (Corrected Colors) ─────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <HiOutlineCurrencyDollar className="w-4 h-4" /> Financial Summary
          </h3>
          <div className="space-y-2">
            {/* Booking Amount - white */}
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Booking Amount</span>
              <span className="text-white text-sm font-medium">Rs {formatAmount(financial_summary?.booking_amount)}</span>
            </div>
            {/* Total Expenses - amber/yellow */}
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Total Expenses</span>
              <span className="text-amber-400 text-sm font-medium">Rs {formatAmount(financial_summary?.total_expenses)}</span>
            </div>
            <div className="border-t border-slate-800 my-1" />
            {/* Total Amount - white bold */}
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Total Amount</span>
              <span className="text-white text-sm font-bold">Rs {formatAmount(financial_summary?.total_amount)}</span>
            </div>
            {/* Paid Amount - green */}
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Paid Amount</span>
              <span className="text-emerald-400 text-sm font-medium">Rs {formatAmount(invoice_summary?.total_paid)}</span>
            </div>
            {/* Balance Due - red */}
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Balance Due</span>
              <span className={`text-sm font-bold ${balanceDue > 0 ? "text-red-400" : "text-emerald-400"}`}>
                Rs {formatAmount(balanceDue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices & Expenses side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Invoices Section ────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <HiOutlineDocumentText className="w-4 h-4 text-amber-500" />
              Invoices
              <span className="text-xs text-slate-500 font-normal">({invoices?.length || 0})</span>
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex gap-3 text-xs">
                <span className="text-emerald-400">Paid: Rs {formatAmount(invoice_summary?.total_paid)}</span>
                <span className="text-red-400">Unpaid: Rs {formatAmount(invoice_summary?.total_unpaid)}</span>
              </div>
              {/* Add Invoice Button */}
              {balanceDue > 0 ? (
                <button
                  onClick={handleAddInvoice}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-xs transition-colors"
                >
                  <HiOutlinePlus className="w-3.5 h-3.5" />
                  Add
                </button>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-700 text-slate-500 cursor-not-allowed rounded-lg text-xs font-medium"
                  title="No balance due"
                >
                  <HiOutlineBan className="w-3.5 h-3.5" />
                  Fully Invoiced
                </button>
              )}
            </div>
          </div>
          <div className="divide-y divide-slate-800">
            {invoices && invoices.length > 0 ? (
              invoices.map((inv) => (
                <div key={inv.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div>
                    <p className="text-white text-sm font-medium">{inv.invoice_number}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${inv.invoice_type === "advance" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>
                        {inv.invoice_type}
                      </span>
                      <span className="text-slate-500 text-xs">{formatDate(inv.invoice_date)}</span>
                    </div>
                    {inv.description && <p className="text-slate-500 text-xs mt-0.5">{inv.description}</p>}
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-white text-sm font-medium">Rs {formatAmount(inv.amount)}</p>
                      <span className={`text-xs font-medium ${inv.payment_status === "paid" ? "text-emerald-400" : "text-red-400"}`}>
                        {inv.payment_status}
                      </span>
                    </div>
                    {inv.payment_status === "unpaid" && (
                      <button
                        onClick={() => { setMarkPaidTarget(inv); setMarkPaidModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Mark as Paid"
                      >
                        <HiOutlineCash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center">
                <HiOutlineDocumentText className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-slate-500 text-sm mt-2">No invoices yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Expenses Section ────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <HiOutlineCurrencyDollar className="w-4 h-4 text-amber-400" />
              Expenses
              <span className="text-xs text-slate-500 font-normal">({expense_summary?.count || 0})</span>
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-400">Total: Rs {formatAmount(expense_summary?.total_expenses)}</span>
              {!ride.is_completed && (
                <button
                  onClick={() => { setEditExpense(null); setExpenseModalOpen(true); }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-xs transition-colors"
                >
                  <HiOutlinePlus className="w-3.5 h-3.5" />
                  Add
                </button>
              )}
            </div>
          </div>
          <div className="divide-y divide-slate-800">
            {expenses && expenses.length > 0 ? (
              expenses.map((exp) => (
                <div key={exp.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div>
                    <p className="text-white text-sm font-medium">Rs {formatAmount(exp.expense_amount)}</p>
                    {exp.expense_note && <p className="text-slate-500 text-xs mt-0.5">{exp.expense_note}</p>}
                    <p className="text-slate-600 text-xs mt-0.5">
                      <HiOutlineCalendar className="w-3 h-3 inline mr-1" />
                      {formatDate(exp.created_at)}
                    </p>
                  </div>
                  {!ride.is_completed && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditExpense(exp); setExpenseModalOpen(true); }} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="Edit">
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setDeleteExpenseTarget(exp); setDeleteExpenseModalOpen(true); }} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center">
                <HiOutlineCurrencyDollar className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-slate-500 text-sm mt-2">No expenses yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── All Modals ───────────────────────────────────── */}
      <ExpenseModal open={expenseModalOpen} onClose={() => { setExpenseModalOpen(false); setEditExpense(null); }} onSave={fetchRide} expense={editExpense} rideId={id} />
      <DeleteExpenseModal open={deleteExpenseModalOpen} onClose={() => { setDeleteExpenseModalOpen(false); setDeleteExpenseTarget(null); }} onConfirm={handleDeleteExpenseConfirm} deleting={deletingExpense} />
      <CompleteModal open={completeModalOpen} onClose={() => setCompleteModalOpen(false)} onConfirm={handleComplete} completing={completing} />
      <InvoiceModal open={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} onSave={fetchRide} ride={ride} balanceDue={balanceDue} />
      <MarkPaidModal open={markPaidModalOpen} onClose={() => { setMarkPaidModalOpen(false); setMarkPaidTarget(null); }} onConfirm={handleMarkPaidConfirm} invoice={markPaidTarget} marking={markingPaid} />
    </div>
  );
}