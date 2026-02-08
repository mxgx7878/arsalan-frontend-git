import API from "./axios";

const rideExpenseApi = {
  getByRide: (rideId) => API.get(`/rides/${rideId}/expenses`),
  create: (rideId, data) => API.post(`/rides/${rideId}/expenses`, data),
  getById: (id) => API.get(`/expenses/${id}`),
  update: (id, data) => API.put(`/expenses/${id}`, data),
  delete: (id) => API.delete(`/expenses/${id}`),
  statistics: (params) => API.get("/expenses/statistics", { params }),
};

export default rideExpenseApi;