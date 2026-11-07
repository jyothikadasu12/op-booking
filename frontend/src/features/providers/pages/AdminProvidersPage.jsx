import { useEffect, useState } from "react";
import { createProvider, getProviders, updateProviderStatus } from "../services/providerApi";

const AdminProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    specialization: "",
    bio: "",
    is_active: true,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setProviders(await getProviders({ activeOnly: false }));
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to load providers.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createProvider(form);
      setForm({ full_name: "", specialization: "", bio: "", is_active: true });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to create provider.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (provider) => {
    try {
      await updateProviderStatus(provider.id, !provider.is_active);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to update provider.");
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold text-heading">Manage providers</h1>

        <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl bg-surface p-6 shadow-sm md:grid-cols-2">
          <input
            required
            placeholder="Full name"
            value={form.full_name}
            onChange={updateField("full_name")}
            className="rounded-lg border border-border px-3 py-2"
          />
          <input
            placeholder="Specialization"
            value={form.specialization}
            onChange={updateField("specialization")}
            className="rounded-lg border border-border px-3 py-2"
          />
          <textarea
            placeholder="Bio"
            value={form.bio}
            onChange={updateField("bio")}
            className="rounded-lg border border-border px-3 py-2 md:col-span-2"
          />
          <label className="flex items-center gap-2 text-sm text-body md:col-span-2">
            <input type="checkbox" checked={form.is_active} onChange={updateField("is_active")} />
            Active
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white md:col-span-2"
          >
            {submitting ? "Creating..." : "Create provider"}
          </button>
        </form>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        <div className="mt-6 overflow-hidden rounded-2xl bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Specialization</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider.id} className="border-t border-border">
                  <td className="px-4 py-3">{provider.full_name}</td>
                  <td className="px-4 py-3">{provider.specialization || "-"}</td>
                  <td className="px-4 py-3">{provider.is_active ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(provider)}
                      className="text-primary hover:underline"
                    >
                      {provider.is_active ? "Deactivate" : "Activate"}
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

export default AdminProvidersPage;
