
import api from "../../../services/apiClient";

// Supports both direct responses and { success, message, data } responses.
const unwrapResponse = (response) => {
  return response?.data?.data ?? response?.data;
};

// Get all services
export const getServices = async ({
  activeOnly = true,
  search,
} = {}) => {
  const response = await api.get("/services", {
    params: {
      active_only: activeOnly,
      search,
    },
  });

  return unwrapResponse(response);
};

// Get one service
export const getService = async (id) => {
  const response = await api.get(`/services/${id}`);
  return unwrapResponse(response);
};

// Create service
export const createService = async (payload) => {
  const response = await api.post("/services", payload);
  return unwrapResponse(response);
};

// Update service
export const updateService = async (id, payload) => {
  const response = await api.patch(`/services/${id}`, payload);
  return unwrapResponse(response);
};

// Update service status
export const updateServiceStatus = async (id, isActive) => {
  const response = await api.patch(`/services/${id}/status`, {
    is_active: isActive,
  });

  return unwrapResponse(response);
};
