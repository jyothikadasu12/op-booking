import api from "../../../services/api";

export const getAvailability = async ({ serviceId, providerId, date, includeInactive } = {}) => {
  const response = await api.get("/availability", {
    params: {
      service_id: serviceId,
      provider_id: providerId,
      date,
      include_inactive: includeInactive,
    },
  });
  return response.data;
};

export const getSlot = async (id) => {
  const response = await api.get(`/availability/${id}`);
  return response.data;
};

export const createSlot = async (payload) => {
  const response = await api.post("/availability", payload);
  return response.data;
};

export const updateSlot = async (id, payload) => {
  const response = await api.patch(`/availability/${id}`, payload);
  return response.data;
};

export const updateSlotStatus = async (id, isActive) => {
  const response = await api.patch(`/availability/${id}/status`, { is_active: isActive });
  return response.data;
};
