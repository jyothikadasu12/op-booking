import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { cancelBooking, getMyBookings, rescheduleBooking } from "../services/bookingApi";
import { getSlot } from "../../availability/services/availabilityApi";
import { getServices } from "../../services/services/serviceApi";
import { getProviders } from "../../providers/services/providerApi";
import { getAvailability } from "../../availability/services/availabilityApi";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import EmptyState from "../../../components/ui/EmptyState";
import Select from "../../../components/ui/Select";
import Spinner from "../../../components/ui/Spinner";

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [slotsById, setSlotsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleSlotId, setRescheduleSlotId] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [bookingList, serviceList, providerList] = await Promise.all([
        getMyBookings({ status: statusFilter || undefined, pageSize: 100 }),
        getServices({ activeOnly: false }),
        getProviders({ activeOnly: false }),
      ]);
      const list = Array.isArray(bookingList) ? bookingList : [];
      setBookings(list);
      setServices(serviceList);
      setProviders(providerList);

      const slotIds = [...new Set(list.map((booking) => booking.slot_id))];
      const slotEntries = await Promise.all(
        slotIds.map(async (slotId) => {
          try {
            const slot = await getSlot(slotId);
            return [slotId, slot];
          } catch {
            return [slotId, null];
          }
        })
      );
      setSlotsById(Object.fromEntries(slotEntries));
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const serviceName = (serviceId) =>
    services.find((service) => service.id === serviceId)?.name || `Service #${serviceId}`;
  const providerName = (providerId) =>
    providers.find((provider) => provider.id === providerId)?.full_name ||
    `Provider #${providerId}`;

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelTarget.id, { reason: "Cancelled by customer" });
      setCancelTarget(null);
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  const openReschedule = async (booking) => {
    setRescheduleTarget(booking);
    setRescheduleSlots([]);
    setRescheduleSlotId("");
    setRescheduleReason("");
    setRescheduleLoading(true);
    try {
      const currentSlot = slotsById[booking.slot_id];
      const slots = await getAvailability({
        serviceId: currentSlot?.service_id,
        includeInactive: false,
      });
      setRescheduleSlots(slots.filter((slot) => slot.id !== booking.slot_id));
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to load alternative slots.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleTarget || !rescheduleSlotId) return;
    try {
      await rescheduleBooking(rescheduleTarget.id, {
        new_slot_id: Number(rescheduleSlotId),
      });
      setRescheduleTarget(null);
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to reschedule booking.");
    }
  };

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-heading">My appointments</h1>
        <Select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full md:w-48"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="You have no appointments matching the selected filter."
          action={<Button onClick={() => navigate("/services")}>Browse services</Button>}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const slot = slotsById[booking.slot_id];
            const canModify = booking.status === "pending" || booking.status === "confirmed";
            return (
              <Card key={booking.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-heading">
                      {slot ? serviceName(slot.service_id) : `Booking #${booking.id}`}
                    </p>
                    <p className="text-sm text-muted">
                      Reference: {booking.booking_reference}
                    </p>
                    {slot && (
                      <>
                        <p className="mt-2 text-sm text-body">
                          Provider: {providerName(slot.provider_id)}
                        </p>
                        <p className="text-sm text-body">
                          Appointment: {new Date(slot.start_time).toLocaleString()}
                        </p>
                      </>
                    )}
                    {booking.reason && (
                      <p className="mt-2 text-sm text-muted">Reason: {booking.reason}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <Badge tone={booking.status}>{booking.status}</Badge>
                    {canModify && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openReschedule(booking)}>
                          Reschedule
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setCancelTarget(booking)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel appointment"
        description="Are you sure you want to cancel this appointment?"
        confirmLabel="Cancel appointment"
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
        loading={cancelling}
      />

      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <Card className="w-full max-w-2xl">
            <h2 className="text-lg font-semibold text-heading">Reschedule appointment</h2>
            <p className="mt-1 text-sm text-muted">
              Choose a new available slot for booking #{rescheduleTarget.booking_reference}.
            </p>

            {rescheduleLoading ? (
              <div className="mt-6 flex justify-center"><Spinner /></div>
            ) : (
              <div className="mt-4 space-y-4">
                <Select
                  label="New slot"
                  value={rescheduleSlotId}
                  onChange={(event) => setRescheduleSlotId(event.target.value)}
                >
                  <option value="">Select a slot</option>
                  {rescheduleSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()} (capacity {slot.capacity})
                    </option>
                  ))}
                </Select>

                {rescheduleSlots.length === 0 && (
                  <p className="text-sm text-muted">No alternative slots available for this service.</p>
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setRescheduleTarget(null)}>
                    Close
                  </Button>
                  <Button onClick={submitReschedule} disabled={!rescheduleSlotId}>
                    Confirm reschedule
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
