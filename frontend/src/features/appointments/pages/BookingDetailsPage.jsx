import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBooking, getBookingHistory } from "../services/bookingApi";
import { getSlot } from "../../availability/services/availabilityApi";
import { getServices } from "../../services/services/serviceApi";
import { getProviders } from "../../providers/services/providerApi";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import Spinner from "../../../components/ui/Spinner";

const BookingDetailsPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [slot, setSlot] = useState(null);
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [bookingData, historyData, serviceList, providerList] = await Promise.all([
          getBooking(id),
          getBookingHistory(id),
          getServices({ activeOnly: false }),
          getProviders({ activeOnly: false }),
        ]);
        setBooking(bookingData);
        setHistory(Array.isArray(historyData) ? historyData : []);
        setServices(serviceList);
        setProviders(providerList);
        const slotData = await getSlot(bookingData.slot_id);
        setSlot(slotData);
      } catch (err) {
        setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to load booking details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Spinner /></div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  const service = services.find((item) => item.id === slot?.service_id);
  const provider = providers.find((item) => item.id === slot?.provider_id);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-heading">Booking details</h1>
            <p className="mt-1 text-sm text-muted">Reference: {booking.booking_reference}</p>
          </div>
          <Badge tone={booking.status}>{booking.status}</Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted">Service</p>
            <p className="font-medium text-heading">{service?.name || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Provider</p>
            <p className="font-medium text-heading">{provider?.full_name || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Appointment start</p>
            <p className="font-medium text-heading">
              {slot ? new Date(slot.start_time).toLocaleString() : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Appointment end</p>
            <p className="font-medium text-heading">
              {slot ? new Date(slot.end_time).toLocaleString() : "-"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted">Reason</p>
            <p className="font-medium text-heading">{booking.reason || "Not provided"}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-heading">Booking history</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No history records available.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {history.map((item) => (
              <div key={item.id} className="rounded-xl border border-border p-4">
                <p className="text-sm font-medium text-heading">
                  {item.old_status || "none"} to {item.new_status}
                </p>
                <p className="text-sm text-muted">{item.change_reason || "No reason provided"}</p>
                <p className="mt-1 text-xs text-muted">
                  {new Date(item.changed_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default BookingDetailsPage;
