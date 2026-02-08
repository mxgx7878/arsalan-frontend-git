import { useState, useEffect, useCallback } from "react";
import partnerApi from "../../api/partnerApi";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineUsers,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineRefresh,
  HiOutlineMail,
  HiOutlinePhone,
} from "react-icons/hi";

// ─── Stats Card ──────────────────────────────────────────────
function StatCard({ label, value, color }) {
  const colors = {
    total: "text-blue-400",
    active: "text-emerald-400",
    inactive: "text-red-400",
    rides: "text-amber-400",
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color] || "text-white"}`}>{value}</p>
    </div>
  );
}

// ─── Partner Modal (Add / Edit) ──────────────────────────────
function PartnerModal({ open, onClose, onSave, partner }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (partner) {
      setForm({
        name: partner.name || "",
        phone: partner.phone || "",
        email: partner.email || "",
        is_active: partner.is_active ?? true,
      });
    } else {
      setForm({ name: "", phone: "", email: "", is_active: true });
    }
    setErrors({});
  }, [partner, open]);

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
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        is_active: form.is_active,
      };

      if (partner) {
        await partnerApi.update(partner.id, payload);
        toast.success("Partner updated successfully");
      } else {
        await partnerApi.create(payload);
        toast.success("Partner added successfully");
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
            {partner ? "Edit Partner" : "Add Partner"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Ahmed Logistics"
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name[0]}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. +92 300 1234567"
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 ${
                errors.phone
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {errors.phone && (
              <p className="text-red-400 text-xs mt-1">{errors.phone[0]}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. partner@example.com"
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email[0]}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Status
            </label>
            <select
              name="is_active"
              value={form.is_active ? "true" : "false"}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.value === "true" })
              }
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
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
              {partner ? "Update" : "Add Partner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ───────────────────────────────
function DeleteModal({ open, onClose, onConfirm, partner, deleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineTrash className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Delete Partner</h3>
        <p className="text-slate-400 text-sm mt-2">
          Are you sure you want to delete{" "}
          <span className="text-white font-medium">{partner?.name}</span>?
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

// ─── Main PartnersPage ───────────────────────────────────────
export default function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [statistics, setStatistics] = useState({
    total_partners: 0,
    active_partners: 0,
    inactive_partners: 0,
    total_partner_rides: 0,
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
  const [editPartner, setEditPartner] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      if (statusFilter !== "") params.is_active = statusFilter;

      const res = await partnerApi.getAll(params);
      const data = res.data.data;
      setPartners(data.partners);
      setStatistics(data.statistics);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load partners");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handleAdd = () => {
    setEditPartner(null);
    setModalOpen(true);
  };

  const handleEdit = (partner) => {
    setEditPartner(partner);
    setModalOpen(true);
  };

  const handleDeleteClick = (partner) => {
    setDeleteTarget(partner);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await partnerApi.delete(deleteTarget.id);
      toast.success("Partner deleted successfully");
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchPartners();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete partner");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusToggle = async (partner) => {
    const newStatus = !partner.is_active;
    try {
      await partnerApi.updateStatus(partner.id, newStatus);
      toast.success(`Partner marked ${newStatus ? "active" : "inactive"}`);
      fetchPartners();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Partner Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your transport partners</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-sm transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Partners" value={statistics.total_partners} color="total" />
        <StatCard label="Active" value={statistics.active_partners} color="active" />
        <StatCard label="Inactive" value={statistics.inactive_partners} color="inactive" />
        <StatCard label="Total Rides" value={statistics.total_partner_rides} color="rides" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
        >
          <option value="">All Status</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
        <button
          onClick={fetchPartners}
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
                  Name
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Contact
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
                  <td colSpan={5} className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm mt-3">Loading partners...</p>
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <HiOutlineUsers className="w-10 h-10 text-slate-700 mx-auto" />
                    <p className="text-slate-500 text-sm mt-3">No partners found</p>
                  </td>
                </tr>
              ) : (
                partners.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-white whitespace-nowrap">
                      {p.name}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="space-y-0.5">
                        {p.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <HiOutlinePhone className="w-3.5 h-3.5" />
                            {p.phone}
                          </div>
                        )}
                        {p.email && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <HiOutlineMail className="w-3.5 h-3.5" />
                            {p.email}
                          </div>
                        )}
                        {!p.phone && !p.email && (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                      {p.rides_count ?? 0}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(p)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          p.is_active
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.is_active ? "bg-emerald-400" : "bg-red-400"
                          }`}
                        />
                        {p.is_active ? "active" : "inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(p)}
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
      <PartnerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchPartners}
        partner={editPartner}
      />
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        partner={deleteTarget}
        deleting={deleting}
      />
    </div>
  );
}