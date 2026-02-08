import API from "./axios";

const rideApi = {
  getAll: (params) => API.get("/rides", { params }),
  getById: (id) => API.get(`/rides/${id}`),
  create: (data) => API.post("/rides", data),
  update: (id, data) => API.put(`/rides/${id}`, data),
  delete: (id) => API.delete(`/rides/${id}`),
  markAsCompleted: (id, data) => API.put(`/rides/${id}/complete`, data),
  statistics: (params) => API.get("/rides/statistics", { params }),
};

export default rideApi;