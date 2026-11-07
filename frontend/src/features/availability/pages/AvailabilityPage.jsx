import { useEffect, useState } from "react";
import { getAvailability } from "../services/availabilityApi";
import { getServices } from "../../services/services/serviceApi";
import { getProviders } from "../../providers/services/providerApi";

const AvailabilityPage = () => {
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [serviceList, providerList] = await Promise.all([
          getServices(),
          getProviders(),
        ]);
        setServices(serviceList);
        setProviders(providerList);
      } catch (err) {
        setError(err?.response?.data?.detail || "Unable to load filters.");
      }
    };
    loadFilters();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAvailability({
        serviceId: serviceId || undefined,
        providerId: providerId || undefined,
        date: date || undefined,
      });
      setSlots(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to load availability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold text-heading">Available appointments</h1>

        <div className="mt-6 grid gap-4 rounded-2xl bg-surface p-6 shadow-sm md:grid-cols-4">
          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            className="rounded-lg border border-border px-3 py-2"
          >
            <option value="">All services</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>

          <select
            value={providerId}
            onChange={(event) => setProviderId(event.target.value)}
            className="rounded-lg border border-border px-3 py-2"
          >
            <option value="">All providers</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.full_name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-lg border border-border px-3 py-2"
          />

          <button
            onClick={fetchSlots}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Search
          </button>
        </div>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <div key={slot.id} className="rounded-2xl bg-surface p-6 shadow-sm">
              <div className="text-sm text-muted">Slot #{slot.id}</div>
              <div className="mt-2 text-heading">Start: {new Date(slot.start_time).toLocaleString()}</div>
              <div className="text-body">End: {new Date(slot.end_time).toLocaleString()}</div>
              <div className="mt-2 text-sm text-muted">
                Capacity: {slot.capacity} remaining
              </div>
            </div>
          ))}
          {!loading && slots.length === 0 && (
            <p className="text-sm text-muted">No slots found. Adjust the filters and search.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
