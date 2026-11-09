
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getServices } from "../../services/services/serviceApi";
import { getProviders } from "../../providers/services/providerApi";
import { getAvailability } from "../../availability/services/availabilityApi";
import { createBooking } from "../services/bookingApi";

import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Spinner from "../../../components/ui/Spinner";

const BookingFlowPage = () => {
  const navigate = useNavigate();

  // Dropdown data
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);

  // Booking filters
  const [serviceId, setServiceId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [date, setDate] = useState("");

  // Slot selection
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");

  // Booking reason
  const [reason, setReason] = useState("");

  // Loading states
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Error state
  const [error, setError] = useState("");

  // 1. Load services and providers
  useEffect(() => {
    const loadFilters = async () => {
      try {
        setLoadingFilters(true);
        setError("");

        const [serviceData, providerData] = await Promise.all([
          getServices(),
          getProviders(),
        ]);

        setServices(Array.isArray(serviceData) ? serviceData : []);
        setProviders(Array.isArray(providerData) ? providerData : []);

      } catch (err) {
        console.error("Filter loading error:", err);
        setError(err.message || "Unable to load services and providers.");
      } finally {
        setLoadingFilters(false);
      }
    };

    loadFilters();
  }, []);

  // 2. Load availability when filters change
  useEffect(() => {
    setSlots([]);
    setSelectedSlotId("");
    setError("");

    if (!serviceId || !providerId) {
      setLoadingSlots(false);
      return;
    }

    let cancelled = false;

    const loadSlots = async () => {
      try {
        setLoadingSlots(true);

        const response = await getAvailability({
          serviceId: Number(serviceId),
          providerId: Number(providerId),
          date: date || undefined,
          includeInactive: false,
        });

        if (cancelled) return;

        console.log("Availability response:", response);

        setSlots(Array.isArray(response) ? response : []);

      } catch (err) {
        if (cancelled) return;

        console.error("Availability error:", err);
        setError(err.message || "Unable to load available slots.");
      } finally {
        if (!cancelled) {
          setLoadingSlots(false);
        }
      }
    };

    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [serviceId, providerId, date]);

  // 3. Book selected appointment
  const handleSubmit = async () => {
    if (!selectedSlotId) {
      setError("Please select an available time slot.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const booking = await createBooking({
        slot_id: Number(selectedSlotId),
        reason: reason.trim() || null,
      });

      console.log("Booking created:", booking);

      if (booking?.id) {
        navigate(`/bookings/${booking.id}`, {
          replace: true,
        });
      } else {
        navigate("/bookings", {
          replace: true,
        });
      }

    } catch (err) {
      console.error("Booking submission error:", err);
      setError(err.message || "Unable to book appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Date formatting
  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // 5. Time formatting
  const formatTime = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loadingFilters) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-heading">
          Book an appointment
        </h1>

        <p className="mt-1 text-sm text-muted">
          Select a service, provider, date, and available time slot.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <div className="space-y-5">

          {/* Service Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-body">
              Service *
            </label>

            <select
              required
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select a service</option>

              {services.map((service) => (
                <option key={service.id} value={String(service.id)}>
                  {service.name} ({service.duration_minutes} min)
                </option>
              ))}
            </select>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-body">
              Provider *
            </label>

            <select
              required
              value={providerId}
              onChange={(event) => setProviderId(event.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select a provider</option>

              {providers.map((provider) => (
                <option key={provider.id} value={String(provider.id)}>
                  {provider.full_name} - {provider.specialization || "General"}
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-body">
              Appointment date *
            </label>

            <input
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Available Slots */}
          <div>
            <h2 className="mb-3 text-base font-semibold text-heading">
              Available time slots
            </h2>

            {!serviceId || !providerId || !date ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-muted">
                Select a service, provider and appointment date to view available slots.
              </p>
            ) : loadingSlots ? (
              <div className="flex items-center gap-2 py-4">
                <Spinner />
                <span className="text-sm text-muted">
                  Loading available slots...
                </span>
              </div>
            ) : slots.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-muted">
                No available slots found. Please choose another date.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {slots.map((slot, index) => {
                  const selected =
                    selectedSlotId === String(slot.id);

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setSelectedSlotId(String(slot.id));
                        setError("");
                      }}
                      className={`rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-primary bg-primary-light ring-2 ring-primary/20"
                          : "border-border bg-white hover:border-primary"
                      }`}
                    >
                      <h3 className="mb-3 font-semibold text-heading">
                        Slot #{index + 1}
                      </h3>

                      <div className="space-y-2 text-sm text-muted">
                        <p>
                          <strong className="text-heading">Start:</strong>{" "}
                          {formatDate(slot.start_time)},{" "}
                          {formatTime(slot.start_time)}
                        </p>

                        <p>
                          <strong className="text-heading">End:</strong>{" "}
                          {formatDate(slot.end_time)},{" "}
                          {formatTime(slot.end_time)}
                        </p>

                        <p>
                          <strong className="text-heading">Capacity:</strong>{" "}
                          {slot.capacity}
                        </p>
                      </div>

                      className={`w-full rounded-xl border p-4 text-left transition ${
  selected
    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
    : "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50"
}`}
                    </button>
                  );
                })}

              </div>
            )}
          </div>

          {/* Reason - Show only after selecting a slot */}
          {selectedSlotId && (
            <Input
              label="Reason (optional)"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Reason for appointment"
            />
          )}

          {/* Book Appointment - Show only after selecting a slot */}
          {selectedSlotId && (
            <Button
              type="button"
              loading={submitting}
              disabled={submitting}
              onClick={handleSubmit}
              className="w-full sm:w-auto"
            >
              Book Appointment
            </Button>
          )}

        </div>
      </Card>
    </div>
  );
};

export default BookingFlowPage;
