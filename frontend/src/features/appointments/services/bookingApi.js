import api from "../../../services/apiClient";

export const createBooking = async (payload) => {
  const response = await api.post("/bookings", payload);
  return response.data;
};

export const getMyBookings = async ({ status, fromDate, toDate, page, pageSize } = {}) => {
  const response = await api.get("/bookings/my", {
    params: {
      status,
      from_date: fromDate,
      to_date: toDate,
      page,
      page_size: pageSize,
    },
  });
  return response.data;
};

export const getBooking = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

export const getBookingHistory = async (id) => {
  const response = await api.get(`/bookings/${id}/history`);
  return response.data;
};

export const rescheduleBooking = async (id, payload) => {
  const response = await api.patch(`/bookings/${id}/reschedule`, payload);
  return response.data;
};

export const cancelBooking = async (id, payload) => {
  const response = await api.patch(`/bookings/${id}/cancel`, payload);
  return response.data;
};

export const getAdminBookings = async (params = {}) => {
  const response = await api.get("/admin/bookings", { params });
  return response.data;
};

export const updateBookingStatus = async (id, payload) => {
  const response = await api.patch(`/admin/bookings/${id}/status`, payload);
  return response.data;
};
