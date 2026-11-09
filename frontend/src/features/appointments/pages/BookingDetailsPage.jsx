
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  getBooking,
  rescheduleBooking,
} from "../services/bookingApi";

import { getAvailability } from "../../availability/services/availabilityApi";

import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Spinner from "../../../components/ui/Spinner";

const BookingDetailsPage = () => {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [slots, setSlots] = useState([]);

  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleSlotId, setRescheduleSlotId] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [serviceId, setServiceId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [date, setDate] = useState("");

  const loadBooking = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getBooking(id);
      setBooking(data);
    } catch (err) {
      setError(err.message || "Unable to load booking details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const loadSlots = async () => {
    if (!serviceId || !providerId || !date) {
      toast.error("Please select service, provider and date.");
      return;
    }

    try {
      setLoadingSlots(true);
      setError("");
      setSlots([]);
      setRescheduleSlotId("");

      const data = await getAvailability({
        serviceId: Number(serviceId),
        providerId: Number(providerId),
        date,
        includeInactive: false,
      });

      setSlots(Array.isArray(data) ? data : []);

      if (!data?.length) {
        toast.info("No available slots for this date.");
      }
    } catch (err) {
      setError(err.message || "Unable to load available slots.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleSlotId) {
      toast.error("Please select an available slot.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await rescheduleBooking(id, {
        slot_id: Number(rescheduleSlotId),
      });

      toast.success("Appointment rescheduled successfully.");

      setShowReschedule(false);
      setRescheduleSlotId("");
      setSlots([]);

      await loadBooking();
    } catch (err) {
      setError(err.message || "Unable to reschedule appointment.");
      toast.error(err.message || "Reschedule failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-xl bg-white p-6">
        {error || "Booking not found."}
      </div>
    );
  }

  const currentSlot = booking.slot;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Booking Details
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage your appointment.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Appointment Information</h2>

          <div>
            <p className="text-sm text-slate-500">Booking Reference</p>
            <p className="font-semibold">
              {booking.booking_reference}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Booking Status</p>
            <p className="font-semibold capitalize">
              {booking.status}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Booking ID</p>
            <p className="font-medium">{booking.id}</p>
          </div>

          {currentSlot && (
            <>
              <div>
                <p className="text-sm text-slate-500">Appointment Date</p>
                <p className="font-medium">
                  {new Date(currentSlot.start_time).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Appointment End</p>
                <p className="font-medium">
                  {new Date(currentSlot.end_time).toLocaleString()}
                </p>
              </div>
            </>
          )}

          <div>
            <p className="text-sm text-slate-500">Reason</p>
            <p className="font-medium">
              {booking.reason || "Not specified"}
            </p>
          </div>
        </div>
      </Card>

      {booking.status !== "cancelled" &&
        booking.status !== "completed" && (
          <Card>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Reschedule Appointment
              </h2>

              {!showReschedule ? (
                <Button onClick={() => setShowReschedule(true)}>
                  Reschedule Appointment
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Service ID
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      className="w-full rounded-lg border p-2"
                      placeholder="Enter service ID"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Provider ID
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={providerId}
                      onChange={(e) => setProviderId(e.target.value)}
                      className="w-full rounded-lg border p-2"
                      placeholder="Enter provider ID"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      New Appointment Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-lg border p-2"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={loadSlots}
                    loading={loadingSlots}
                    disabled={loadingSlots}
                  >
                    Find Available Slots
                  </Button>

                  {loadingSlots && <Spinner />}

                  {!loadingSlots && slots.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">
                        Available Time Slots
                      </h3>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() =>
                              setRescheduleSlotId(String(slot.id))
                            }
                            className={`rounded-xl border p-4 text-left transition ${
                              rescheduleSlotId === String(slot.id)
                                ? "border-primary bg-primary-light"
                                : "border-slate-200 hover:border-primary"
                            }`}
                          >
                            <p className="font-semibold">
                              {new Date(
                                slot.start_time
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>

                            <p className="text-sm text-slate-500">
                              {new Date(
                                slot.start_time
                              ).toLocaleDateString()}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Capacity: {slot.capacity}
                            </p>

                            {rescheduleSlotId === String(slot.id) && (
                              <p className="mt-2 text-sm font-semibold text-primary">
                                Selected
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-slate-500">
                    Selected slot ID: {rescheduleSlotId || "No slot selected"}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={submitReschedule}
                      disabled={!rescheduleSlotId || submitting}
                      loading={submitting}
                    >
                      Confirm reschedule
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReschedule(false);
                        setSlots([]);
                        setRescheduleSlotId("");
                        setError("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
    </div>
  );
};

export default BookingDetailsPage;
