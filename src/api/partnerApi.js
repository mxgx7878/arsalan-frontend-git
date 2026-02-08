import API from "./axios";

const partnerApi = {
  getAll: (params) => API.get("/partners", { params }),
  getById: (id) => API.get(`/partners/${id}`),
  create: (data) => API.post("/partners", data),
  update: (id, data) => API.put(`/partners/${id}`, data),
  updateStatus: (id, is_active) => API.patch(`/partners/${id}/status`, { is_active }),
  delete: (id) => API.delete(`/partners/${id}`),
};

export default partnerApi;