import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/apiClient";
import Card from "../../../components/ui/Card";
import Spinner from "../../../components/ui/Spinner";

const AdminDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        setSummary(response.data?.data ?? null);
      } catch (err) {
        setError(err.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Spinner /></div>;
  }

  const cards = summary
    ? [
        ["Total bookings", summary.total_bookings],
        ["Today's bookings", summary.today_bookings],
        ["Pending", summary.pending_bookings],
        ["Confirmed", summary.confirmed_bookings],
        ["Completed", summary.completed_bookings],
        ["Cancelled", summary.cancelled_bookings],
        ["Active services", summary.active_services],
        ["Active providers", summary.active_providers],
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-heading">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted">Monitor booking and clinic activity.</p>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-heading">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold text-heading">Services</h2>
          <p className="mt-2 text-sm text-muted">Create and manage clinic services.</p>
          <Link to="/admin/services" className="mt-4 inline-block text-sm font-medium text-primary">
            Manage services
          </Link>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-heading">Providers</h2>
          <p className="mt-2 text-sm text-muted">Manage doctors and service providers.</p>
          <Link to="/admin/providers" className="mt-4 inline-block text-sm font-medium text-primary">
            Manage providers
          </Link>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-heading">Availability</h2>
          <p className="mt-2 text-sm text-muted">Create and control appointment slots.</p>
          <Link to="/admin/availability" className="mt-4 inline-block text-sm font-medium text-primary">
            Manage availability
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
