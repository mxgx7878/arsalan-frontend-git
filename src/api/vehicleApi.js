import API from "./axios";

const vehicleApi = {
  getAll: (params) => API.get("/vehicles", { params }),
  getById: (id) => API.get(`/vehicles/${id}`),
  create: (data) => API.post("/vehicles", data),
  update: (id, data) => API.put(`/vehicles/${id}`, data),
  updateStatus: (id, status) => API.patch(`/vehicles/${id}/status`, { status }),
  delete: (id) => API.delete(`/vehicles/${id}`),
};

export default vehicleApi;
