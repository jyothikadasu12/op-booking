import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getServices } from "../../services/services/serviceApi";
import { getProviders } from "../../providers/services/providerApi";
import { getAvailability } from "../../availability/services/availabilityApi";
import { createBooking } from "../services/bookingApi";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Spinner from "../../../components/ui/Spinner";

const BookingFlowPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [reason, setReason] = useState("");
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [serviceList, providerList] = await Promise.all([
          getServices(),
          getProviders(),
        ]);
        setServices(serviceList);
        setProviders(providerList);
      } catch (err) {
        setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to load booking filters.");
      } finally {
        setLoadingFilters(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!serviceId || !providerId || !date) {
      setSlots([]);
      return;
    }

    const loadSlots = async () => {
      setLoadingSlots(true);
      setError("");
      try {
        const data = await getAvailability({
          serviceId: Number(serviceId),
          providerId: Number(providerId),
          date,
          includeInactive: false,
        });
        setSlots(data);
        setSelectedSlotId("");
      } catch (err) {
        setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to load available slots.");
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [serviceId, providerId, date]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedSlotId) {
      setError("Please select an appointment slot.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await createBooking({
        slot_id: Number(selectedSlotId),
        reason: reason || null,
      });
      const booking = response?.data;
      if (booking?.id) {
        navigate(`/bookings/${booking.id}`, { replace: true });
      } else {
        navigate("/bookings", { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Unable to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProviders = providers;

  if (loadingFilters) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-heading">Book an appointment</h1>
        <p className="mt-1 text-sm text-muted">
          Select a service, provider, date, and available time slot.
        </p>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Service"
            required
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} ({service.duration_minutes} min)
              </option>
            ))}
          </Select>

          <Select
            label="Provider"
            required
            value={providerId}
            onChange={(event) => setProviderId(event.target.value)}
          >
            <option value="">Select a provider</option>
            {filteredProviders.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.full_name} - {provider.specialization || "General"}
              </option>
            ))}
          </Select>

          <Input
            label="Appointment date"
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />

          <div>
            <p className="mb-2 text-sm font-medium text-body">Available time slots</p>
            {loadingSlots ? (
              <Spinner />
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted">Choose filters above to load available slots.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={slot.id}
                    onClick={() => setSelectedSlotId(String(slot.id))}
                    className={`rounded-xl border p-4 text-left transition ${
                      selectedSlotId === String(slot.id)
                        ? "border-primary bg-primary-light"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <p className="text-sm font-semibold text-heading">
                      {new Date(slot.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(slot.start_time).toLocaleDateString()} to{" "}
                      {new Date(slot.end_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-1 text-xs text-muted">Capacity: {slot.capacity}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Reason (optional)"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason for appointment"
          />

          <Button type="submit" loading={submitting} disabled={!selectedSlotId}>
            Confirm booking
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default BookingFlowPage;
