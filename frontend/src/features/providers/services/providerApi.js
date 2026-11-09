import api from "../../../services/apiClient";

export const getProviders = async ({ activeOnly = true, search } = {}) => {
  const response = await api.get("/providers", { params: { active_only: activeOnly, search } });
  return response.data;
};

export const getProvider = async (id) => {
  const response = await api.get(`/providers/${id}`);
  return response.data;
};

export const createProvider = async (payload) => {
  const response = await api.post("/providers", payload);
  return response.data;
};

export const updateProvider = async (id, payload) => {
  const response = await api.patch(`/providers/${id}`, payload);
  return response.data;
};

export const updateProviderStatus = async (id, isActive) => {
  const response = await api.patch(`/providers/${id}/status`, { is_active: isActive });
  return response.data;
};
