import { useState, useEffect, useCallback } from "react";
import companyExpenseApi from "../../api/companyExpenseApi";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineCurrencyDollar,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineRefresh,
  HiOutlineCalendar,
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

// ─── Stats Card ──────────────────────────────────────────────
function StatCard({ label, value, color }) {
  const colors = {
    total: "text-blue-400",
    amount: "text-amber-400",
    average: "text-purple-400",
    month: "text-emerald-400",
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color] || "text-white"}`}>{value}</p>
    </div>
  );
}

// ─── Expense Modal (Add / Edit) ──────────────────────────────
function ExpenseModal({ open, onClose, onSave, expense }) {
  const [form, setForm] = useState({
    expense_date: "",
    amount: "",
    description: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        expense_date: expense.expense_date ? expense.expense_date.split("T")[0] : "",
        amount: expense.amount || "",
        description: expense.description || "",
        notes: expense.notes || "",
      });
    } else {
      setForm({
        expense_date: new Date().toISOString().split("T")[0],
        amount: "",
        description: "",
        notes: "",
      });
    }
    setErrors({});
  }, [expense, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const payload = {
        expense_date: form.expense_date,
        amount: Number(form.amount),
        description: form.description,
        notes: form.notes || null,
      };

      if (expense) {
        await companyExpenseApi.update(expense.id, payload);
        toast.success("Expense updated successfully");
      } else {
        await companyExpenseApi.create(payload);
        toast.success("Expense added successfully");
      }
      onSave();
      onClose();
    } catch (err) {
      const res = err.response;
      if (res?.status === 400 && res.data?.error) {
        setErrors(res.data.error);
      } else {
        toast.error(res?.data?.message || "Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">
            {expense ? "Edit Expense" : "Add Expense"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              name="expense_date"
              value={form.expense_date}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                errors.expense_date
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {errors.expense_date && (
              <p className="text-red-400 text-xs mt-1">
                {Array.isArray(errors.expense_date) ? errors.expense_date[0] : errors.expense_date}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Amount <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 ${
                errors.amount
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {errors.amount && (
              <p className="text-red-400 text-xs mt-1">
                {Array.isArray(errors.amount) ? errors.amount[0] : errors.amount}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. Office rent, Fuel, Maintenance"
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 ${
                errors.description
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">
                {Array.isArray(errors.description) ? errors.description[0] : errors.description}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Optional notes..."
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 resize-none ${
                errors.notes
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {errors.notes && (
              <p className="text-red-400 text-xs mt-1">
                {Array.isArray(errors.notes) ? errors.notes[0] : errors.notes}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-900 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              )}
              {expense ? "Update" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ───────────────────────────────
function DeleteModal({ open, onClose, onConfirm, expense, deleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineTrash className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Delete Expense</h3>
        <p className="text-slate-400 text-sm mt-2">
          Are you sure you want to delete this expense of{" "}
          <span className="text-white font-medium">Rs {formatAmount(expense?.amount)}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 disabled:bg-red-500/50 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {deleting && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main CompanyExpensesPage ────────────────────────────────
export default function CompanyExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [statistics, setStatistics] = useState({
    total_expenses: 0,
    total_amount: 0,
    average_amount: 0,
    current_month_total: 0,
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await companyExpenseApi.getAll(params);
      const data = res.data.data;
      setExpenses(data.expenses);
      setStatistics(data.statistics);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [page, search, startDate, endDate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate]);

  const handleAdd = () => {
    setEditExpense(null);
    setModalOpen(true);
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setModalOpen(true);
  };

  const handleDeleteClick = (expense) => {
    setDeleteTarget(expense);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await companyExpenseApi.delete(deleteTarget.id);
      toast.success("Expense deleted successfully");
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete expense");
    } finally {
      setDeleting(false);
    }
  };

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Company Expenses</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track and manage company expenses</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-sm transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Expenses" value={statistics.total_expenses} color="total" />
        <StatCard label="Total Amount" value={`Rs ${formatAmount(statistics.total_amount)}`} color="amount" />
        <StatCard label="Average" value={`Rs ${formatAmount(statistics.average_amount)}`} color="average" />
        <StatCard label="This Month" value={`Rs ${formatAmount(statistics.current_month_total)}`} color="month" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by description or notes..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          title="Start date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          title="End date"
        />
        {(startDate || endDate) && (
          <button
            onClick={clearDateFilters}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-red-400 hover:text-red-300 transition-colors"
            title="Clear date filters"
          >
            <HiOutlineX className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={fetchExpenses}
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <HiOutlineRefresh className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm mt-3">Loading expenses...</p>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <HiOutlineCurrencyDollar className="w-10 h-10 text-slate-700 mx-auto" />
                    <p className="text-slate-500 text-sm mt-3">No expenses found</p>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                        <HiOutlineCalendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(exp.expense_date)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-white">
                      {exp.description}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 max-w-[200px] truncate">
                      {exp.notes || <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-amber-400 whitespace-nowrap text-right font-medium">
                      Rs {formatAmount(exp.amount)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(exp)}
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(exp)}
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
            <p className="text-xs text-slate-500">
              Showing {pagination.from || 0}–{pagination.to || 0} of {pagination.total}
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
                  const prev = arr[idx - 1];
                  const showDots = prev && p - prev > 1;
                  return (
                    <span key={p} className="flex items-center">
                      {showDots && <span className="px-1 text-slate-600 text-xs">…</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
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
      <ExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchExpenses}
        expense={editExpense}
      />
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        expense={deleteTarget}
        deleting={deleting}
      />
    </div>
  );
}