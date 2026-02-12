import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  HiOutlineBookOpen,
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
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (partner) {
        await partnerApi.update(partner.id, form);
        toast.success("Partner updated successfully");
      } else {
        await partnerApi.create(form);
        toast.success("Partner added successfully");
      }
      onSave();
      onClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error(err.response?.data?.message || "Something went wrong");
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">
            {partner ? "Edit Partner" : "Add Partner"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Partner name"
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                errors.phone
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
              }`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Status</label>
            <select
              name="is_active"
              value={form.is_active ? "true" : "false"}
              onChange={(e) => setForm({ ...form, is_active: e.target.value === "true" })}
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
  const navigate = useNavigate();
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

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
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
      const msg = err.response?.data?.message || "Failed to delete partner";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusToggle = async (partner) => {
    try {
      await partnerApi.updateStatus(partner.id, !partner.is_active);
      toast.success(`Partner ${partner.is_active ? "deactivated" : "activated"}`);
      fetchPartners();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <HiOutlineUsers className="w-6 h-6 text-amber-500" />
            Partner Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage your transport partners</p>
        </div>
        <button
          onClick={() => { setEditPartner(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-slate-900 text-sm font-bold hover:bg-amber-400 transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Partners" value={statistics.total_partners} color="total" />
        <StatCard label="Active" value={statistics.active_partners} color="active" />
        <StatCard label="Inactive" value={statistics.inactive_partners} color="inactive" />
        <StatCard label="Total Rides" value={statistics.total_partner_rides} color="rides" />
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search partners..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-2">
            {["", "1", "0"].map((val) => (
              <button
                key={val}
                onClick={() => handleStatusFilter(val)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === val
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                    : "text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-800"
                }`}
              >
                {val === "" ? "All" : val === "1" ? "Active" : "Inactive"}
              </button>
            ))}
            <button
              onClick={() => { setSearch(""); setStatusFilter(""); setPage(1); }}
              className="p-2 rounded-lg text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800 transition-colors"
              title="Reset filters"
            >
              <HiOutlineRefresh className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">Name</th>
                <th className="text-left px-5 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">Contact</th>
                <th className="text-center px-5 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">Rides</th>
                <th className="text-center px-5 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">Status</th>
                <th className="text-right px-5 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-4 bg-slate-800 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : partners.length === 0
                ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <HiOutlineUsers className="w-8 h-8 text-slate-700 mx-auto" />
                      <p className="text-slate-500 text-sm mt-2">No partners found</p>
                    </td>
                  </tr>
                )
                : partners.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-white font-medium">{p.name}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5">
                          {p.phone && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                              <HiOutlinePhone className="w-3 h-3" /> {p.phone}
                            </div>
                          )}
                          {p.email && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                              <HiOutlineMail className="w-3 h-3" /> {p.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center text-slate-300">
                        {p.rides_count ?? 0}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleStatusToggle(p)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            p.is_active
                              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          }`}
                        >
                          {p.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/partners/${p.id}/ledger`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            title="View Ledger"
                          >
                            <HiOutlineBookOpen className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
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