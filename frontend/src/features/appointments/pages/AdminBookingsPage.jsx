import { useEffect, useState } from "react";
import { getAdminBookings, updateBookingStatus } from "../services/bookingApi";
import { getServices } from "../../services/services/serviceApi";
import { getProviders } from "../../providers/services/providerApi";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Select from "../../../components/ui/Select";
import Spinner from "../../../components/ui/Spinner";

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusDrafts, setStatusDrafts] = useState({});

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [serviceList, providerList, bookingList] = await Promise.all([
        getServices({ activeOnly: false }),
        getProviders({ activeOnly: false }),
        getAdminBookings({
          status: statusFilter || undefined,
          service_id: serviceFilter || undefined,
          provider_id: providerFilter || undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
          pageSize: 100,
        }),
      ]);
      setServices(serviceList);
      setProviders(providerList);
      setBookings(Array.isArray(bookingList) ? bookingList : []);
      const drafts = {};
      (Array.isArray(bookingList) ? bookingList : []).forEach((booking) => {
        drafts[booking.id] = booking.status;
      });
      setStatusDrafts(drafts);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter, serviceFilter, providerFilter, fromDate, toDate]);

  const handleStatusUpdate = async (bookingId) => {
    try {
      await updateBookingStatus(bookingId, { status: statusDrafts[bookingId] });
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to update booking status.");
    }
  };

  const serviceName = (serviceId) =>
    services.find((service) => service.id === serviceId)?.name || `Service #${serviceId}`;
  const providerName = (providerId) =>
    providers.find((provider) => provider.id === providerId)?.full_name ||
    `Provider #${providerId}`;

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-heading">Manage bookings</h1>

      <Card>
        <div className="grid gap-4 md:grid-cols-5">
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>

          <Select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)}>
            <option value="">All services</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </Select>

          <Select value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)}>
            <option value="">All providers</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>{provider.full_name}</option>
            ))}
          </Select>

          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="rounded-lg border border-border px-3 py-2"
          />
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="rounded-lg border border-border px-3 py-2"
          />
        </div>
      </Card>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-border">
                  <td className="px-4 py-3">{booking.booking_reference}</td>
                  <td className="px-4 py-3">User #{booking.user_id}</td>
                  <td className="px-4 py-3">Slot #{booking.slot_id}</td>
                  <td className="px-4 py-3">{booking.reason || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={booking.status}>{booking.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Select
                        value={statusDrafts[booking.id] || booking.status}
                        onChange={(event) =>
                          setStatusDrafts((current) => ({
                            ...current,
                            [booking.id]: event.target.value,
                          }))
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </Select>
                      <Button size="sm" onClick={() => handleStatusUpdate(booking.id)}>
                        Save
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <p className="p-4 text-sm text-muted">No bookings found.</p>}
        </div>
      </Card>
    </div>
  );
};

export default AdminBookingsPage;
