import { useState, useEffect } from "react";
import vehicleApi from "../../api/vehicleApi";
import partyApi from "../../api/partyApi";
import partnerApi from "../../api/partnerApi";
import rideApi from "../../api/rideApi";
import toast from "react-hot-toast";
import { HiOutlineX } from "react-icons/hi";

export default function RideModal({ open, onClose, onSave, ride, preSelectedPartyId = null }) {
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
        party_id: preSelectedPartyId ? String(preSelectedPartyId) : "",
        ride_type: "personal",
        partner_id: "",
        booking_amount: "",
        advance_amount: "",
        notes: "",
      });
    }
    setErrors({});
  }, [ride, open, preSelectedPartyId]);

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
                disabled={!!preSelectedPartyId && !ride}
                className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                  errors.party_id
                    ? "border-red-500 focus:ring-red-500/30"
                    : "border-slate-700 focus:ring-amber-500/30 focus:border-amber-500"
                } ${preSelectedPartyId && !ride ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <option value="" disabled>Select party</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {preSelectedPartyId && !ride && (
                <p className="text-amber-400 text-xs mt-1">Party auto-selected</p>
              )}
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

            {/* Booking & Advance amounts */}
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