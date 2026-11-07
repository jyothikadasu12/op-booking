import { useEffect, useState } from "react";
import { getServices } from "../services/serviceApi";

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setServices(await getServices());
      } catch (err) {
        setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to load services.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading services...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold text-heading">Our services</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="rounded-2xl bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-heading">{service.name}</h2>
              <p className="mt-2 text-sm text-muted">{service.description || "No description provided."}</p>
              <div className="mt-4 text-sm text-body">
                Duration: {service.duration_minutes} minutes
                <br />
                Price: ${Number(service.price).toFixed(2)}
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <p className="text-sm text-muted">No active services are available right now.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
