import { useState, useEffect, useCallback } from "react";
import vehicleExpenseApi from "../../api/vehicleExpenseApi";
import vehicleApi from "../../api/vehicleApi";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineTruck,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineRefresh,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineClipboardList,
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

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, color, icon: Icon }) {
  const colors = {
    total: "text-blue-400",
    month: "text-amber-400",
    year: "text-purple-400",
    vehicles: "text-emerald-400",
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className={`w-4 h-4 ${colors[color] || "text-slate-400"}`} />
        </div>
      )}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${colors[color] || "text-white"}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Expense Modal (Add / Edit) ───────────────────────────────
function ExpenseModal({ open, onClose, onSave, expense, vehicles }) {
  const [form, setForm] = useState({
    vehicle_id: "",
    amount: "",
    description: "",
    expense_date: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        vehicle_id: expense.vehicle_id ? String(expense.vehicle_id) : "",
        amount: expense.amount ?? "",
        description: expense.description ?? "",
        expense_date: expense.expense_date ? expense.expense_date.slice(0, 10) : "",
      });
    } else {
      setForm({ vehicle_id: "", amount: "", description: "", expense_date: "" });
    }
    setErrors({});
  }, [expense, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = {
      vehicle_id: Number(form.vehicle_id),
      amount: parseFloat(form.amount),
      description: form.description,
      expense_date: form.expense_date,
    };
    try {
      if (expense) {
        await vehicleExpenseApi.update(expense.id, payload);
        toast.success("Expense updated successfully");
      } else {
        await vehicleExpenseApi.create(payload);
        toast.success("Expense added successfully");
      }
      onSave();
      onClose();
    } catch (err) {
      const res = err.response;
      if (res?.status === 400 && res.data?.errors) {
        setErrors(res.data.errors);
      } else {
        toast.error(res?.data?.message || "Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (field) =>
    errors[field] ? (
      <p className="text-red-400 text-xs mt-1">{errors[field][0]}</p>
    ) : null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">
            {expense ? "Edit Expense" : "Add Vehicle Expense"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Vehicle */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Vehicle <span className="text-red-400">*</span>
            </label>
            <select
              name="vehicle_id"
              value={form.vehicle_id}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                errors.vehicle_id
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            >
              <option value="">Select vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_number} ({v.type})
                </option>
              ))}
            </select>
            {fieldError("vehicle_id")}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Amount (Rs) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 ${
                errors.amount
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {fieldError("amount")}
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
              required
              maxLength={255}
              placeholder="e.g. Fuel refill, tyre replacement..."
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 ${
                errors.description
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {fieldError("description")}
          </div>

          {/* Expense Date */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Expense Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              name="expense_date"
              value={form.expense_date}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                errors.expense_date
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {fieldError("expense_date")}
          </div>

          {/* Actions */}
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

// ─── Delete Modal ─────────────────────────────────────────────
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
          Are you sure you want to delete
          {expense?.description && (
            <> — <span className="text-white font-medium">{expense.description}</span></>
          )}
          ? This action cannot be undone.
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

// ─── Per-Vehicle Breakdown ────────────────────────────────────
function VehicleBreakdown({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <HiOutlineChartBar className="w-4 h-4" />
        Per-Vehicle Breakdown
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {data.map((item) => (
          <div key={item.vehicle_id} className="bg-slate-800 rounded-lg p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <HiOutlineTruck className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-white text-sm font-semibold truncate">
                {item.vehicle?.vehicle_number ?? `#${item.vehicle_id}`}
              </p>
              <span
                className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                  item.vehicle?.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {item.vehicle?.status ?? "—"}
              </span>
            </div>
            <p className="text-amber-400 text-lg font-bold">
              Rs {formatAmount(item.total_amount)}
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-slate-500 text-xs">{item.expense_count} expense{item.expense_count !== 1 ? "s" : ""}</p>
              <p className="text-slate-600 text-xs">Last: {formatDate(item.last_expense_date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function VehicleExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch vehicles for dropdowns ─────────────────────────
  useEffect(() => {
    vehicleApi
      .getPersonal()
      .then((res) => {
        const list = res.data?.data?.vehicles ?? [];
        setVehicles(Array.isArray(list) ? list : []);
      })
      .catch(() => toast.error("Failed to load vehicles"));
  }, []);

  // ── Fetch expenses ────────────────────────────────────────
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      if (vehicleFilter) params.vehicle_id = vehicleFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await vehicleExpenseApi.getAll(params);
      const d = res.data?.data;
      setExpenses(d?.data ?? []);
      setPagination({
        current_page: d?.current_page ?? 1,
        last_page: d?.last_page ?? 1,
        total: d?.total ?? 0,
        from: d?.from ?? 0,
        to: d?.to ?? 0,
      });
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [page, search, vehicleFilter, startDate, endDate]);

  // ── Fetch statistics ──────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await vehicleExpenseApi.statistics();
      setStats(res.data?.data ?? null);
    } catch {
      // silent — stats are supplementary
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, vehicleFilter, startDate, endDate]);

  const refreshAll = () => {
    fetchExpenses();
    fetchStats();
  };

  const handleAdd = () => {
    setEditExpense(null);
    setModalOpen(true);
  };

  const handleEdit = (exp) => {
    setEditExpense(exp);
    setModalOpen(true);
  };

  const handleDeleteClick = (exp) => {
    setDeleteTarget(exp);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await vehicleExpenseApi.delete(deleteTarget.id);
      toast.success("Expense deleted successfully");
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      refreshAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete expense");
    } finally {
      setDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setVehicleFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasActiveFilters = search || vehicleFilter || startDate || endDate;

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Vehicle Expenses</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track maintenance, fuel, and operational costs per vehicle</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-sm transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* ── Stats Cards ──────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total All Time"
            value={`Rs ${formatAmount(stats.total_all_time)}`}
            color="total"
            icon={HiOutlineCurrencyDollar}
          />
          <StatCard
            label="This Month"
            value={`Rs ${formatAmount(stats.total_this_month)}`}
            color="month"
            icon={HiOutlineCalendar}
          />
          <StatCard
            label="This Year"
            value={`Rs ${formatAmount(stats.total_this_year)}`}
            color="year"
            icon={HiOutlineChartBar}
          />
          <StatCard
            label="Vehicles Tracked"
            value={stats.per_vehicle?.length ?? 0}
            color="vehicles"
            icon={HiOutlineTruck}
          />
        </div>
      )}

      {/* ── Per-Vehicle Breakdown ────────────────────────── */}
      {stats?.per_vehicle && <VehicleBreakdown data={stats.per_vehicle} />}

      {/* ── Filters Row ──────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Vehicle Filter */}
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="w-full lg:w-52 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          >
            <option value="">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vehicle_number}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full lg:w-36 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
            <span className="text-slate-600 text-sm flex-shrink-0">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full lg:w-36 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-2.5 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-colors flex items-center gap-1.5"
              >
                <HiOutlineX className="w-4 h-4" />
                Clear
              </button>
            )}
            <button
              onClick={refreshAll}
              className="px-3 py-2.5 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-colors"
              title="Refresh"
            >
              <HiOutlineRefresh className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HiOutlineClipboardList className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-300">All Expenses</span>
            {pagination.total > 0 && (
              <span className="text-xs text-slate-600 ml-1">({pagination.total} total)</span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Loading expenses...</span>
                    </div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <HiOutlineCurrencyDollar className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">
                      {hasActiveFilters ? "No expenses match your filters" : "No vehicle expenses recorded yet"}
                    </p>
                    {!hasActiveFilters && (
                      <button
                        onClick={handleAdd}
                        className="mt-3 text-amber-500 text-sm hover:text-amber-400 transition-colors"
                      >
                        Add the first expense →
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Vehicle */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <HiOutlineTruck className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {exp.vehicle?.vehicle_number ?? "—"}
                          </p>
                          <p className="text-slate-500 text-xs capitalize">
                            {exp.vehicle?.type ?? ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-3.5">
                      <p className="text-slate-300 text-sm max-w-xs truncate">{exp.description}</p>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-slate-400 text-sm">{formatDate(exp.expense_date)}</span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <span className="text-amber-400 font-semibold text-sm">
                        Rs {formatAmount(exp.amount)}
                      </span>
                    </td>

                    {/* Actions */}
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
              Showing {pagination.from ?? 0}–{pagination.to ?? 0} of {pagination.total} expenses
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.current_page === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 px-2">
                {pagination.current_page} / {pagination.last_page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                disabled={pagination.current_page === pagination.last_page}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────── */}
      <ExpenseModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditExpense(null); }}
        onSave={refreshAll}
        expense={editExpense}
        vehicles={vehicles}
      />
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
        expense={deleteTarget}
        deleting={deleting}
      />
    </div>
  );
}