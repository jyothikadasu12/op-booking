import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { getMyBookings } from "../../appointments/services/bookingApi";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Spinner from "../../../components/ui/Spinner";

const CustomerDashboardPage = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyBookings({ pageSize: 50 });
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to load your appointments.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const counts = bookings.reduce(
    (acc, booking) => {
      acc.total += 1;
      if (booking.status === "pending") acc.pending += 1;
      if (booking.status === "confirmed") acc.confirmed += 1;
      if (booking.status === "completed") acc.completed += 1;
      if (booking.status === "cancelled") acc.cancelled += 1;
      return acc;
    },
    { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  );

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Customer dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Welcome back, {user?.full_name}. Manage your clinic appointments here.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => (window.location.href = "/services")}>Browse services</Button>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total", counts.total],
          ["Pending", counts.pending],
          ["Confirmed", counts.confirmed],
          ["Completed", counts.completed],
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-heading">{value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-heading">Recent bookings</h2>
          <Link to="/bookings" className="text-sm font-medium text-primary">
            View all
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No appointments yet"
              description="Book your first appointment to see it here."
              action={
                <Button onClick={() => (window.location.href = "/services")}>Book appointment</Button>
              }
            />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col gap-2 rounded-xl border border-border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-heading">Booking #{booking.booking_reference}</p>
                  <p className="text-sm text-muted">Slot #{booking.slot_id}</p>
                </div>
                <Badge tone={booking.status}>{booking.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CustomerDashboardPage;
