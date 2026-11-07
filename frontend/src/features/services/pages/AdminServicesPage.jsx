import { useEffect, useState } from "react";
import {
  createService,
  getServices,
  updateServiceStatus,
} from "../services/serviceApi";

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration_minutes: 30,
    price: 0,
    is_active: true,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setServices(await getServices({ activeOnly: false }));
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to load services.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createService({
        ...form,
        duration_minutes: Number(form.duration_minutes),
        price: Number(form.price),
      });
      setForm({ name: "", description: "", duration_minutes: 30, price: 0, is_active: true });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to create service.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (service) => {
    try {
      await updateServiceStatus(service.id, !service.is_active);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to update status.");
    }
  };

  const updateField = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold text-heading">Manage services</h1>

        <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl bg-surface p-6 shadow-sm md:grid-cols-2">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={updateField("name")}
            className="rounded-lg border border-border px-3 py-2"
          />
          <input
            type="number"
            min="1"
            required
            placeholder="Duration (minutes)"
            value={form.duration_minutes}
            onChange={updateField("duration_minutes")}
            className="rounded-lg border border-border px-3 py-2"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="Price"
            value={form.price}
            onChange={updateField("price")}
            className="rounded-lg border border-border px-3 py-2"
          />
          <label className="flex items-center gap-2 text-sm text-body">
            <input type="checkbox" checked={form.is_active} onChange={updateField("is_active")} />
            Active
          </label>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={updateField("description")}
            className="rounded-lg border border-border px-3 py-2 md:col-span-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white md:col-span-2"
          >
            {submitting ? "Creating..." : "Create service"}
          </button>
        </form>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        <div className="mt-6 overflow-hidden rounded-2xl bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-t border-border">
                  <td className="px-4 py-3">{service.name}</td>
                  <td className="px-4 py-3">{service.duration_minutes} min</td>
                  <td className="px-4 py-3">${Number(service.price).toFixed(2)}</td>
                  <td className="px-4 py-3">{service.is_active ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(service)}
                      className="text-primary hover:underline"
                    >
                      {service.is_active ? "Deactivate" : "Activate"}
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

export default AdminServicesPage;
