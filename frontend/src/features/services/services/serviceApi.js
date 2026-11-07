import api from "../../../services/api";

export const getServices = async ({ activeOnly = true, search } = {}) => {
  const response = await api.get("/services", { params: { active_only: activeOnly, search } });
  return response.data;
};

export const getService = async (id) => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};

export const createService = async (payload) => {
  const response = await api.post("/services", payload);
  return response.data;
};

export const updateService = async (id, payload) => {
  const response = await api.patch(`/services/${id}`, payload);
  return response.data;
};

export const updateServiceStatus = async (id, isActive) => {
  const response = await api.patch(`/services/${id}/status`, { is_active: isActive });
  return response.data;
};
