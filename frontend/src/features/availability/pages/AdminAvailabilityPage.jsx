import { useEffect, useState } from "react";
import { getServices } from "../../services/services/serviceApi";
import { getProviders } from "../../providers/services/providerApi";
import {
  createSlot,
  getAvailability,
  updateSlotStatus,
} from "../services/availabilityApi";

const AdminAvailabilityPage = () => {
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({
    service_id: "",
    provider_id: "",
    start_time: "",
    end_time: "",
    capacity: 1,
    is_active: true,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [serviceList, providerList, slotList] = await Promise.all([
        getServices({ activeOnly: false }),
        getProviders({ activeOnly: false }),
        getAvailability({ includeInactive: true }),
      ]);
      setServices(serviceList);
      setProviders(providerList);
      setSlots(slotList);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to load availability data.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createSlot({
        service_id: Number(form.service_id),
        provider_id: Number(form.provider_id),
        start_time: form.start_time,
        end_time: form.end_time,
        capacity: Number(form.capacity),
        is_active: form.is_active,
      });
      setForm({
        service_id: "",
        provider_id: "",
        start_time: "",
        end_time: "",
        capacity: 1,
        is_active: true,
      });
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to create slot.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (slot) => {
    try {
      await updateSlotStatus(slot.id, !slot.is_active);
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to update slot.");
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold text-heading">Manage availability</h1>

        <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl bg-surface p-6 shadow-sm md:grid-cols-2">
          <select
            required
            value={form.service_id}
            onChange={updateField("service_id")}
            className="rounded-lg border border-border px-3 py-2"
          >
            <option value="">Select service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>

          <select
            required
            value={form.provider_id}
            onChange={updateField("provider_id")}
            className="rounded-lg border border-border px-3 py-2"
          >
            <option value="">Select provider</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.full_name}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            required
            value={form.start_time}
            onChange={updateField("start_time")}
            className="rounded-lg border border-border px-3 py-2"
          />
          <input
            type="datetime-local"
            required
            value={form.end_time}
            onChange={updateField("end_time")}
            className="rounded-lg border border-border px-3 py-2"
          />
          <input
            type="number"
            min="1"
            required
            placeholder="Capacity"
            value={form.capacity}
            onChange={updateField("capacity")}
            className="rounded-lg border border-border px-3 py-2"
          />
          <label className="flex items-center gap-2 text-sm text-body">
            <input type="checkbox" checked={form.is_active} onChange={updateField("is_active")} />
            Active
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white md:col-span-2"
          >
            {submitting ? "Creating..." : "Create slot"}
          </button>
        </form>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        <div className="mt-6 overflow-hidden rounded-2xl bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id} className="border-t border-border">
                  <td className="px-4 py-3">{slot.id}</td>
                  <td className="px-4 py-3">{slot.service_id}</td>
                  <td className="px-4 py-3">{slot.provider_id}</td>
                  <td className="px-4 py-3">
                    {new Date(slot.start_time).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{slot.capacity}</td>
                  <td className="px-4 py-3">{slot.is_active ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(slot)}
                      className="text-primary hover:underline"
                    >
                      {slot.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAvailabilityPage;
