import { useState, useEffect, useCallback } from "react";
import vehicleApi from "../../api/vehicleApi";
import partnerApi from "../../api/partnerApi";
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
} from "react-icons/hi";

// ─── Stats Card ──────────────────────────────────────────────
function StatCard({ label, value, color }) {
  const colors = {
    total: "text-blue-400",
    active: "text-emerald-400",
    inactive: "text-red-400",
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color] || "text-white"}`}>{value}</p>
    </div>
  );
}

// ─── Vehicle Modal (Add / Edit) ──────────────────────────────
function VehicleModal({ open, onClose, onSave, vehicle }) {
  const [form, setForm] = useState({
    vehicle_number: "",
    type: "",
    status: "active",
    partner_id: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

  // Load partners list when modal opens
  useEffect(() => {
    if (!open) return;
    setLoadingPartners(true);
    partnerApi
      .getAll({ per_page: 100, is_active: 1 })
      .then((res) => setPartners(res.data.data.partners || []))
      .catch(() => toast.error("Failed to load markets"))
      .finally(() => setLoadingPartners(false));
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (vehicle) {
      setForm({
        vehicle_number: vehicle.vehicle_number || "",
        type: vehicle.type || "",
        status: vehicle.status || "active",
        partner_id: vehicle.partner_id ? String(vehicle.partner_id) : "",
      });
    } else {
      setForm({ vehicle_number: "", type: "", status: "active", partner_id: "" });
    }
    setErrors({});
  }, [vehicle, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Clear partner when switching away from market type
      if (name === "type" && value !== "partner") {
        updated.partner_id = "";
      }
      return updated;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (form.type === "partner" && !form.partner_id) {
      setErrors({ partner_id: ["Please select a market."] });
      return;
    }

    setSaving(true);
    setErrors({});

    const payload = {
      vehicle_number: form.vehicle_number,
      type: form.type,
      status: form.status,
      partner_id: form.type === "partner" ? Number(form.partner_id) : null,
    };

    try {
      if (vehicle) {
        await vehicleApi.update(vehicle.id, payload);
        toast.success("Vehicle updated successfully");
      } else {
        await vehicleApi.create(payload);
        toast.success("Vehicle added successfully");
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
            {vehicle ? "Edit Vehicle" : "Add Vehicle"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Vehicle Number */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Vehicle Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="vehicle_number"
              value={form.vehicle_number}
              onChange={handleChange}
              placeholder="e.g. TRK-001"
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 ${
                errors.vehicle_number
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {errors.vehicle_number && (
              <p className="text-red-400 text-xs mt-1">{errors.vehicle_number[0]}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Type <span className="text-red-400">*</span>
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                errors.type
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            >
              <option value="" disabled>Select type</option>
              <option value="personal">Personal</option>
              <option value="partner">Market</option>
            </select>
            {errors.type && (
              <p className="text-red-400 text-xs mt-1">{errors.type[0]}</p>
            )}
          </div>

          {/* Market (Partner) — shown only when type = partner */}
          {form.type === "partner" && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Market <span className="text-red-400">*</span>
              </label>
              {loadingPartners ? (
                <div className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-500 text-sm">
                  Loading markets...
                </div>
              ) : (
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
                  <option value="" disabled>Select market</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.partner_id && (
                <p className="text-red-400 text-xs mt-1">
                  {Array.isArray(errors.partner_id) ? errors.partner_id[0] : errors.partner_id}
                </p>
              )}
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
              {vehicle ? "Update" : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ───────────────────────────────
function DeleteModal({ open, onClose, onConfirm, vehicle, deleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineTrash className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Delete Vehicle</h3>
        <p className="text-slate-400 text-sm mt-2">
          Are you sure you want to delete{" "}
          <span className="text-white font-medium">{vehicle?.vehicle_number}</span>?
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

// ─── Main VehiclesPage ───────────────────────────────────────
export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [statistics, setStatistics] = useState({
    total_vehicles: 0,
    active_vehicles: 0,
    inactive_vehicles: 0,
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await vehicleApi.getAll(params);
      const data = res.data.data;
      setVehicles(data.vehicles);
      setStatistics(data.statistics);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handleAdd = () => {
    setEditVehicle(null);
    setModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle);
    setModalOpen(true);
  };

  const handleDeleteClick = (vehicle) => {
    setDeleteTarget(vehicle);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await vehicleApi.delete(deleteTarget.id);
      toast.success("Vehicle deleted successfully");
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete vehicle");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusToggle = async (vehicle) => {
    const newStatus = vehicle.status === "active" ? "inactive" : "active";
    try {
      await vehicleApi.updateStatus(vehicle.id, newStatus);
      toast.success(`Vehicle marked ${newStatus}`);
      fetchVehicles();
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Pagination page numbers
  const pageNumbers = [];
  for (let i = 1; i <= pagination.last_page; i++) {
    if (
      i === 1 ||
      i === pagination.last_page ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== "...") {
      pageNumbers.push("...");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Vehicle Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your fleet vehicles</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-sm transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Vehicles" value={statistics.total_vehicles} color="total" />
        <StatCard label="Active" value={statistics.active_vehicles} color="active" />
        <StatCard label="Inactive" value={statistics.inactive_vehicles} color="inactive" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by number or type..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          onClick={fetchVehicles}
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
                  Vehicle
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Market
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Rides
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
                  <td colSpan={6} className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm mt-3">Loading vehicles...</p>
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <HiOutlineTruck className="w-10 h-10 text-slate-700 mx-auto" />
                    <p className="text-slate-500 text-sm mt-3">No vehicles found</p>
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-white whitespace-nowrap">
                      {v.vehicle_number}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          v.type === "partner"
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {v.type === "partner" ? "Market" : "Personal"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                      {v.partner?.name || (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                      {v.rides_count ?? 0}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(v)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          v.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            v.status === "active" ? "bg-emerald-400" : "bg-red-400"
                          }`}
                        />
                        {v.status === "active" ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(v)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(v)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
        {!loading && pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Showing {pagination.from ?? 0}–{pagination.to ?? 0} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 text-slate-400 hover:text-white disabled:text-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              {pageNumbers.map((p, i) => (
                <span key={i}>
                  {p === "..." ? (
                    <span className="px-2 text-slate-600 text-sm">...</span>
                  ) : (
                    <button
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-amber-500 text-slate-900"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  )}
                </span>
              ))}
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
      <VehicleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchVehicles}
        vehicle={editVehicle}
      />
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        vehicle={deleteTarget}
        deleting={deleting}
      />
    </div>
  );
}