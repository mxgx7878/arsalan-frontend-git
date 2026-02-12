import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import partnerLedgerApi from "../../api/partnerLedgerApi";
import partnerApi from "../../api/partnerApi";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineArrowLeft,
  HiOutlineRefresh,
  HiOutlineCalendar,
  HiOutlineBookOpen,
  HiOutlineCash,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
} from "react-icons/hi";

// ─── Format helpers ──────────────────────────────────────────
const formatCurrency = (val) => {
  const num = parseFloat(val) || 0;
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ─── Stat Card ───────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    blue: "text-blue-400 bg-blue-500/10",
    green: "text-emerald-400 bg-emerald-500/10",
    red: "text-red-400 bg-red-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };
  const [textColor, bgColor] = (colorMap[color] || colorMap.blue).split(" ");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${textColor}`} />
        </div>
      </div>
      <p className={`text-xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}

// ─── Opening Balance Modal ───────────────────────────────────
function OpeningBalanceModal({ open, onClose, onSave, partnerId }) {
  const [form, setForm] = useState({ opening_balance: "", opening_date: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ opening_balance: "", opening_date: "" });
      setErrors({});
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.opening_balance && form.opening_balance !== 0) newErrors.opening_balance = "Required";
    if (!form.opening_date) newErrors.opening_date = "Required";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await partnerLedgerApi.setOpeningBalance(partnerId, {
        opening_balance: parseFloat(form.opening_balance),
        opening_date: form.opening_date,
      });
      toast.success(res.data.message || "Opening balance set successfully");
      onSave();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to set opening balance";
      toast.error(msg);
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">Set Opening Balance</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Opening Date *</label>
            <input
              type="date"
              value={form.opening_date}
              onChange={(e) => setForm({ ...form, opening_date: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
            {errors.opening_date && <p className="text-red-400 text-xs mt-1">{errors.opening_date}</p>}
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Opening Balance *</label>
            <input
              type="number"
              step="0.01"
              value={form.opening_balance}
              onChange={(e) => setForm({ ...form, opening_balance: e.target.value })}
              placeholder="e.g. 92190.00"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
            {errors.opening_balance && <p className="text-red-400 text-xs mt-1">{errors.opening_balance}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500 text-slate-900 text-sm font-bold hover:bg-amber-400 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Set Balance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Ledger Entry Modal (Add / Edit) ─────────────────────────
function EntryModal({ open, onClose, onSave, entry, partnerId }) {
  const [form, setForm] = useState({
    entry_date: "",
    description: "",
    type: "credit",
    amount: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      const type = parseFloat(entry.credit) > 0 ? "credit" : "debit";
      const amount = type === "credit" ? entry.credit : entry.debit;
      setForm({
        entry_date: entry.entry_date ? entry.entry_date.split("T")[0] : "",
        description: entry.description || "",
        type,
        amount: amount || "",
        notes: entry.notes || "",
      });
    } else {
      setForm({ entry_date: "", description: "", type: "credit", amount: "", notes: "" });
    }
    setErrors({});
  }, [entry, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.entry_date) newErrors.entry_date = "Required";
    if (!form.description.trim()) newErrors.description = "Required";
    if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = "Must be greater than 0";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      entry_date: form.entry_date,
      description: form.description,
      credit: form.type === "credit" ? parseFloat(form.amount) : 0,
      debit: form.type === "debit" ? parseFloat(form.amount) : 0,
      notes: form.notes || null,
    };

    setSaving(true);
    try {
      if (entry) {
        const res = await partnerLedgerApi.updateEntry(partnerId, entry.id, payload);
        toast.success(res.data.message || "Entry updated successfully");
      } else {
        const res = await partnerLedgerApi.addEntry(partnerId, payload);
        toast.success(res.data.message || "Entry added successfully");
      }
      onSave();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save entry";
      toast.error(msg);
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">
            {entry ? "Edit Entry" : "Add Ledger Entry"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Date *</label>
              <input
                type="date"
                value={form.entry_date}
                onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
              {errors.entry_date && <p className="text-red-400 text-xs mt-1">{errors.entry_date}</p>}
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Type *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "credit" })}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    form.type === "credit"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  Credit
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "debit" })}
                  className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    form.type === "debit"
                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                      : "bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  Debit
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Description *</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. BILL JAN 25, PAID BASIT"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Amount *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
            {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Optional notes..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500 text-slate-900 text-sm font-bold hover:bg-amber-400 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : entry ? "Update Entry" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ───────────────────────────────
function DeleteModal({ open, onClose, onConfirm, entry, deleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Delete Entry</h3>
        <p className="text-slate-400 text-sm mb-1">Are you sure you want to delete this ledger entry?</p>
        {entry && (
          <p className="text-slate-500 text-xs mb-4">
            "{entry.description}" — {formatDate(entry.entry_date)}
          </p>
        )}
        <p className="text-amber-400 text-xs mb-5">
          This will recalculate all subsequent balances.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-400 transition-colors disabled:opacity-50">
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Ledger Page ────────────────────────────────────────
export default function PartnerLedgerPage() {
  const { partnerId } = useParams();
  const navigate = useNavigate();

  // State
  const [partner, setPartner] = useState(null);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({
    total_credit: 0,
    total_debit: 0,
    opening_balance: 0,
    closing_balance: 0,
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hasOpeningBalance, setHasOpeningBalance] = useState(false);

  // Modal state
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [openingModalOpen, setOpeningModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch ledger entries
  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 50 };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await partnerLedgerApi.getEntries(partnerId, params);
      const data = res.data.data;

      setPartner(data.partner);
      setEntries(data.entries || []);
      setSummary(data.summary || {});
      setPagination(data.pagination || {});

      // Check if opening balance exists
      const hasOB = (data.entries || []).some(
        (e) => e.description === "OPENING BALANCE"
      );
      setHasOpeningBalance(hasOB);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("Partner not found");
        navigate("/partners");
      } else {
        toast.error("Failed to load ledger");
      }
    } finally {
      setLoading(false);
    }
  }, [partnerId, page, startDate, endDate, navigate]);

  // Check opening balance from summary
  const checkOpeningBalance = useCallback(async () => {
    try {
      const res = await partnerLedgerApi.getSummary(partnerId);
      const data = res.data.data;
      const hasOB = data.summary?.opening_balance !== undefined && data.summary?.total_entries > 0;
      setHasOpeningBalance(hasOB || (data.last_5_entries || []).some(e => e.description === "OPENING BALANCE"));
    } catch {
      // silent
    }
  }, [partnerId]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  useEffect(() => {
    checkOpeningBalance();
  }, [checkOpeningBalance]);

  // Handlers
  const handleFilter = () => {
    setPage(1);
    fetchLedger();
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleEdit = (entry) => {
    if (entry.description === "OPENING BALANCE") {
      toast.error("Cannot edit opening balance entry");
      return;
    }
    setEditEntry(entry);
    setEntryModalOpen(true);
  };

  const handleDeleteClick = (entry) => {
    if (entry.description === "OPENING BALANCE") {
      toast.error("Cannot delete opening balance entry");
      return;
    }
    setDeleteTarget(entry);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await partnerLedgerApi.deleteEntry(partnerId, deleteTarget.id);
      toast.success(res.data.message || "Entry deleted successfully");
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchLedger();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete entry");
    } finally {
      setDeleting(false);
    }
  };

  // Balance color
  const getBalanceColor = (val) => {
    const num = parseFloat(val) || 0;
    if (num > 0) return "text-emerald-400";
    if (num < 0) return "text-red-400";
    return "text-slate-300";
  };

  // Loading skeleton
  if (loading && !partner) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/partners")}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {partner?.name || "Partner"} — Ledger
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Current Balance:{" "}
              <span className={`font-semibold ${getBalanceColor(partner?.current_balance)}`}>
                {formatCurrency(partner?.current_balance)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!hasOpeningBalance && (
            <button
              onClick={() => setOpeningModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-amber-500/40 text-amber-400 text-sm font-medium hover:bg-amber-500/10 transition-colors"
            >
              <HiOutlineBookOpen className="w-4 h-4" />
              Set Opening Balance
            </button>
          )}
          <button
            onClick={() => { setEditEntry(null); setEntryModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-slate-900 text-sm font-bold hover:bg-amber-400 transition-colors"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Opening Balance"
          value={formatCurrency(summary.opening_balance)}
          icon={HiOutlineBookOpen}
          color="blue"
        />
        <StatCard
          label="Total Credit"
          value={formatCurrency(summary.total_credit)}
          icon={HiOutlineTrendingUp}
          color="green"
        />
        <StatCard
          label="Total Debit"
          value={formatCurrency(summary.total_debit)}
          icon={HiOutlineTrendingDown}
          color="red"
        />
        <StatCard
          label="Closing Balance"
          value={formatCurrency(summary.closing_balance)}
          icon={HiOutlineCash}
          color={parseFloat(summary.closing_balance) >= 0 ? "amber" : "red"}
        />
      </div>

      {/* Date Range Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs text-slate-500 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs text-slate-500 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              disabled={!startDate || !endDate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <HiOutlineCalendar className="w-4 h-4" />
              Filter
            </button>
            {(startDate || endDate) && (
              <button
                onClick={handleClearFilter}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
              >
                <HiOutlineRefresh className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">Date</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">Description</th>
                <th className="text-right px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">Credit</th>
                <th className="text-right px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">Debit</th>
                <th className="text-right px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">Balance</th>
                <th className="text-right px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <HiOutlineBookOpen className="w-8 h-8 text-slate-700 mx-auto" />
                    <p className="text-slate-500 text-sm mt-2">No ledger entries yet</p>
                    {!hasOpeningBalance && (
                      <p className="text-slate-600 text-xs mt-1">Start by setting an opening balance</p>
                    )}
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const isOpening = entry.description === "OPENING BALANCE";
                  const credit = parseFloat(entry.credit) || 0;
                  const debit = parseFloat(entry.debit) || 0;

                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-slate-800/40 transition-colors ${isOpening ? "bg-amber-500/5" : ""}`}
                    >
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                        {formatDate(entry.entry_date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isOpening && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-400 rounded">
                              OB
                            </span>
                          )}
                          <span className={`font-medium ${isOpening ? "text-amber-300" : debit > 0 ? "text-yellow-300" : "text-white"}`}>
                            {entry.description}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-slate-500 mt-0.5">{entry.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {credit > 0 ? (
                          <span className="text-emerald-400">{formatCurrency(credit)}</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {debit > 0 ? (
                          <span className="text-red-400">{formatCurrency(debit)}</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-semibold ${getBalanceColor(entry.balance)}`}>
                        {formatCurrency(entry.balance)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isOpening ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                              title="Edit"
                            >
                              <HiOutlinePencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(entry)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Showing {pagination.from}–{pagination.to} of {pagination.total} entries
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.last_page || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <span key={p}>
                      {showEllipsis && <span className="px-1 text-slate-600">…</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors ${
                          p === page
                            ? "bg-amber-500 text-slate-900"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}
              <button
                onClick={() => setPage((prev) => Math.min(pagination.last_page, prev + 1))}
                disabled={page >= pagination.last_page}
                className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <OpeningBalanceModal
        open={openingModalOpen}
        onClose={() => setOpeningModalOpen(false)}
        onSave={() => { fetchLedger(); checkOpeningBalance(); }}
        partnerId={partnerId}
      />
      <EntryModal
        open={entryModalOpen}
        onClose={() => { setEntryModalOpen(false); setEditEntry(null); }}
        onSave={fetchLedger}
        entry={editEntry}
        partnerId={partnerId}
      />
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
        entry={deleteTarget}
        deleting={deleting}
      />
    </div>
  );
}