import API from "./axios";

const vehicleExpenseApi = {
  getAll: (params) => API.get("/vehicle-expenses", { params }),
  getById: (id) => API.get(`/vehicle-expenses/${id}`),
  create: (data) => API.post("/vehicle-expenses", data),
  update: (id, data) => API.put(`/vehicle-expenses/${id}`, data),
  delete: (id) => API.delete(`/vehicle-expenses/${id}`),
  statistics: (params) => API.get("/vehicle-expenses/statistics", { params }),

};

export default vehicleExpenseApi;