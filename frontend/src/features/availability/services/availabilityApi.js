
import api from "../../../services/apiClient";

// Get availability slots
export const getAvailability = async ({
  serviceId,
  providerId,
  date,
  includeInactive = false,
} = {}) => {
  const response = await api.get("/availability", {
    params: {
      service_id: serviceId,
      provider_id: providerId,
      on_date: date,
      include_inactive: includeInactive,
    },
  });

  return response.data;
};

// Get one availability slot
export const getSlot = async (slotId) => {
  const response = await api.get(`/availability/${slotId}`);
  return response.data;
};

// Create availability slot
export const createSlot = async (payload) => {
  const response = await api.post("/admin/availability", payload);
  return response.data;
};

// Update availability slot
export const updateSlot = async (slotId, payload) => {
  const response = await api.patch(
    `/admin/availability/${slotId}`,
    payload
  );

  return response.data;
};

// Update active/inactive status
export const updateSlotStatus = async (slotId, isActive) => {
  const response = await api.patch(
    `/admin/availability/${slotId}/status`,
    { is_active: isActive }
  );

  return response.data;
};

// Delete availability slot
export const deleteSlot = async (slotId) => {
  const response = await api.delete(
    `/admin/availability/${slotId}`
  );

  return response.data;
};
