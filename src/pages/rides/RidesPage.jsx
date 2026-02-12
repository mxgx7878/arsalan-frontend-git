import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import rideApi from "../../api/rideApi";
import RideModal from "../../components/rides/RideModal";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineRefresh,
  HiOutlineEye,
  HiOutlineFilter,
  HiOutlineCheckCircle,
} from "react-icons/hi";

// ─── Stats Card ──────────────────────────────────────────────
function StatCard({ label, value, color }) {
  const colors = {
    total: "text-blue-400",
    completed: "text-emerald-400",
    pending: "text-amber-400",
    amount: "text-purple-400",
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color] || "text-white"}`}>{value}</p>
    </div>
  );
}

// ─── Delete Confirmation Modal ───────────────────────────────
function DeleteModal({ open, onClose, onConfirm, ride, deleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineTrash className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Delete Ride</h3>
        <p className="text-slate-400 text-sm mt-2">
          Are you sure you want to delete{" "}
          <span className="text-white font-medium">{ride?.ride_number}</span>?
          This will also delete all related invoices and expenses.
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

// ─── Complete Ride Modal ─────────────────────────────────────
function CompleteModal({ open, onClose, onConfirm, ride, completing }) {
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");

  useEffect(() => {
    if (open) {
      setPaymentReceived(false);
      setCompletionNotes("");
    }
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
        <p className="text-slate-400 text-sm mt-2 text-center">
          Mark <span className="text-white font-medium">{ride?.ride_number}</span> as completed?
        </p>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={paymentReceived}
              onChange={(e) => setPaymentReceived(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30"
            />
            <span className="text-sm text-slate-300">Balance payment received</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Completion Notes
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={2}
              placeholder="Optional notes..."
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ payment_received: paymentReceived, completion_notes: completionNotes })}
            disabled={completing}
            className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {completing && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Format currency ─────────────────────────────────────────
function formatAmount(val) {
  const num = Number(val);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Main RidesPage ──────────────────────────────────────────
export default function RidesPage() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editRide, setEditRide] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [completing, setCompleting] = useState(false);

  const fetchRides = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      if (statusFilter !== "") params.is_completed = statusFilter;
      if (typeFilter) params.ride_type = typeFilter;

      const res = await rideApi.getAll(params);
      const data = res.data.data;
      setRides(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
        from: data.from,
        to: data.to,
      });
    } catch {
      toast.error("Failed to load rides");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await rideApi.statistics();
      setStats(res.data.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  const handleAdd = () => {
    setEditRide(null);
    setModalOpen(true);
  };

  const handleEdit = (ride) => {
    if (ride.is_completed) {
      toast.error("Cannot edit completed ride");
      return;
    }
    setEditRide(ride);
    setModalOpen(true);
  };

  const handleDeleteClick = (ride) => {
    if (ride.is_completed) {
      toast.error("Cannot delete completed ride");
      return;
    }
    setDeleteTarget(ride);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await rideApi.delete(deleteTarget.id);
      toast.success("Ride deleted successfully");
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchRides();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete ride");
    } finally {
      setDeleting(false);
    }
  };

  const handleCompleteClick = (ride) => {
    setCompleteTarget(ride);
    setCompleteModalOpen(true);
  };

  const handleCompleteConfirm = async (data) => {
    if (!completeTarget) return;
    setCompleting(true);
    try {
      await rideApi.markAsCompleted(completeTarget.id, data);
      toast.success("Ride completed successfully");
      setCompleteModalOpen(false);
      setCompleteTarget(null);
      fetchRides();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete ride");
    } finally {
      setCompleting(false);
    }
  };

  const handleSave = () => {
    fetchRides();
    fetchStats();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Ride Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your transport rides</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-sm transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Create Ride
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Rides" value={stats.overall?.total_rides ?? 0} color="total" />
          <StatCard label="Completed" value={stats.by_status?.completed ?? 0} color="completed" />
          <StatCard label="Pending" value={stats.by_status?.pending ?? 0} color="pending" />
          <StatCard
            label="Total Booking"
            value={`₨ ${formatAmount(stats.overall?.total_booking_amount ?? 0)}`}
            color="amount"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ride number..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
        >
          <option value="">All Status</option>
          <option value="0">Pending</option>
          <option value="1">Completed</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
        >
          <option value="">All Types</option>
          <option value="personal">Personal</option>
          <option value="partner">Partner</option>
        </select>
        <button
          onClick={() => { fetchRides(); fetchStats(); }}
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
                  Ride #
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Party
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm mt-3">Loading rides...</p>
                  </td>
                </tr>
              ) : rides.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <HiOutlineFilter className="w-10 h-10 text-slate-700 mx-auto" />
                    <p className="text-slate-500 text-sm mt-3">No rides found</p>
                  </td>
                </tr>
              ) : (
                rides.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-white whitespace-nowrap">
                      {r.ride_number}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                      {r.start_date ? new Date(r.start_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                      {r.vehicle?.vehicle_number || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                      {r.party?.name || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap max-w-[200px] truncate" title={r.route || ""}>
                      {r.route || "—"}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          r.ride_type === "partner"
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {r.ride_type}
                      </span>
                      {r.partner && (
                        <span className="text-slate-500 text-xs ml-1.5">{r.partner.name}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-white whitespace-nowrap text-right font-medium">
                      ₨ {formatAmount(r.booking_amount)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          r.is_completed
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            r.is_completed ? "bg-emerald-400" : "bg-amber-400"
                          }`}
                        />
                        {r.is_completed ? "Completed" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/rides/${r.id}`)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="View"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        {!r.is_completed && (
                          <>
                            <button
                              onClick={() => handleCompleteClick(r)}
                              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Mark Complete"
                            >
                              <HiOutlineCheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(r)}
                              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <HiOutlinePencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(r)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
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
      <RideModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        ride={editRide}
      />
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        ride={deleteTarget}
        deleting={deleting}
      />
      <CompleteModal
        open={completeModalOpen}
        onClose={() => {
          setCompleteModalOpen(false);
          setCompleteTarget(null);
        }}
        onConfirm={handleCompleteConfirm}
        ride={completeTarget}
        completing={completing}
      />
    </div>
  );
}