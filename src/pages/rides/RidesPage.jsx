import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import rideApi from "../../api/rideApi";
import vehicleApi from "../../api/vehicleApi";
import partyApi from "../../api/partyApi";
import partnerApi from "../../api/partnerApi";
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

// ─── Ride Modal (Add / Edit) ─────────────────────────────────
function RideModal({ open, onClose, onSave, ride }) {
  const [form, setForm] = useState({
    ride_number: "",
    start_date: "",
    vehicle_id: "",
    party_id: "",
    ride_type: "personal",
    partner_id: "",
    booking_amount: "",
    advance_amount: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [parties, setParties] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Fetch dropdown options
  useEffect(() => {
    if (!open) return;
    setLoadingOptions(true);
    Promise.all([
      vehicleApi.getAll({ per_page: 100, status: "active" }),
      partyApi.getAll({ per_page: 100, is_active: 1 }),
      partnerApi.getAll({ per_page: 100, is_active: 1 }),
    ])
      .then(([vRes, paRes, prRes]) => {
        setVehicles(vRes.data.data.vehicles || []);
        setParties(paRes.data.data.parties || []);
        setPartners(prRes.data.data.partners || []);
      })
      .catch(() => toast.error("Failed to load options"))
      .finally(() => setLoadingOptions(false));
  }, [open]);

  useEffect(() => {
    if (ride) {
      setForm({
        ride_number: ride.ride_number || "",
        start_date: ride.start_date ? ride.start_date.split("T")[0] : "",
        vehicle_id: ride.vehicle_id || "",
        party_id: ride.party_id || "",
        ride_type: ride.ride_type || "personal",
        partner_id: ride.partner_id || "",
        booking_amount: ride.booking_amount || "",
        advance_amount: ride.advance_amount || "",
        notes: ride.notes || "",
      });
    } else {
      setForm({
        ride_number: "",
        start_date: "",
        vehicle_id: "",
        party_id: "",
        ride_type: "personal",
        partner_id: "",
        booking_amount: "",
        advance_amount: "",
        notes: "",
      });
    }
    setErrors({});
  }, [ride, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "ride_type" && value === "personal") {
        updated.partner_id = "";
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
        ride_number: form.ride_number,
        start_date: form.start_date,
        vehicle_id: Number(form.vehicle_id),
        party_id: Number(form.party_id),
        ride_type: form.ride_type,
        partner_id: form.ride_type === "partner" ? Number(form.partner_id) : null,
        booking_amount: Number(form.booking_amount),
        advance_amount: form.advance_amount ? Number(form.advance_amount) : 0,
        notes: form.notes || null,
      };

      if (ride) {
        await rideApi.update(ride.id, payload);
        toast.success("Ride updated successfully");
      } else {
        await rideApi.create(payload);
        toast.success("Ride created successfully");
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 flex items-center justify-between px-6 py-4 border-b border-slate-800 z-10">
          <h3 className="text-lg font-semibold text-white">
            {ride ? "Edit Ride" : "Create Ride"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {loadingOptions ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-sm mt-3">Loading options...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Ride Number */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Ride Number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="ride_number"
                value={form.ride_number}
                onChange={handleChange}
                placeholder="e.g. RIDE-001"
                className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 ${
                  errors.ride_number
                    ? "border-red-500 focus:ring-red-500/30"
                    : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
                }`}
              />
              {errors.ride_number && (
                <p className="text-red-400 text-xs mt-1">{Array.isArray(errors.ride_number) ? errors.ride_number[0] : errors.ride_number}</p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Start Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                  errors.start_date
                    ? "border-red-500 focus:ring-red-500/30"
                    : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
                }`}
              />
              {errors.start_date && (
                <p className="text-red-400 text-xs mt-1">{Array.isArray(errors.start_date) ? errors.start_date[0] : errors.start_date}</p>
              )}
            </div>

            {/* Vehicle */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Vehicle <span className="text-red-400">*</span>
              </label>
              <select
                name="vehicle_id"
                value={form.vehicle_id}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                  errors.vehicle_id
                    ? "border-red-500 focus:ring-red-500/30"
                    : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
                }`}
              >
                <option value="" disabled>Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicle_number} ({v.type})
                  </option>
                ))}
              </select>
              {errors.vehicle_id && (
                <p className="text-red-400 text-xs mt-1">{Array.isArray(errors.vehicle_id) ? errors.vehicle_id[0] : errors.vehicle_id}</p>
              )}
            </div>

            {/* Party */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Party <span className="text-red-400">*</span>
              </label>
              <select
                name="party_id"
                value={form.party_id}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                  errors.party_id
                    ? "border-red-500 focus:ring-red-500/30"
                    : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
                }`}
              >
                <option value="" disabled>Select party</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.party_id && (
                <p className="text-red-400 text-xs mt-1">{Array.isArray(errors.party_id) ? errors.party_id[0] : errors.party_id}</p>
              )}
            </div>

            {/* Ride Type */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Ride Type <span className="text-red-400">*</span>
              </label>
              <select
                name="ride_type"
                value={form.ride_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              >
                <option value="personal">Personal</option>
                <option value="partner">Partner</option>
              </select>
            </div>

            {/* Partner (conditional) */}
            {form.ride_type === "partner" && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Partner <span className="text-red-400">*</span>
                </label>
                <select
                  name="partner_id"
                  value={form.partner_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                    errors.partner_id
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
                  }`}
                >
                  <option value="" disabled>Select partner</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.partner_id && (
                  <p className="text-red-400 text-xs mt-1">{Array.isArray(errors.partner_id) ? errors.partner_id[0] : errors.partner_id}</p>
                )}
              </div>
            )}

            {/* Booking & Advance amounts in a row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Booking Amount <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="booking_amount"
                  value={form.booking_amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 ${
                    errors.booking_amount
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
                  }`}
                />
                {errors.booking_amount && (
                  <p className="text-red-400 text-xs mt-1">{Array.isArray(errors.booking_amount) ? errors.booking_amount[0] : errors.booking_amount}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Advance Amount
                </label>
                <input
                  type="number"
                  name="advance_amount"
                  value={form.advance_amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 ${
                    errors.advance_amount
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
                  }`}
                />
                {errors.advance_amount && (
                  <p className="text-red-400 text-xs mt-1">{Array.isArray(errors.advance_amount) ? errors.advance_amount[0] : errors.advance_amount}</p>
                )}
              </div>
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
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none"
              />
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
                {ride ? "Update" : "Create Ride"}
              </button>
            </div>
          </form>
        )}
      </div>
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