import API from "./axios";

const partyApi = {
  getAll: (params) => API.get("/parties", { params }),
  getById: (id) => API.get(`/parties/${id}`),
  create: (data) => API.post("/parties", data),
  update: (id, data) => API.put(`/parties/${id}`, data),
  updateStatus: (id, is_active) => API.patch(`/parties/${id}/status`, { is_active }),
  delete: (id) => API.delete(`/parties/${id}`),
};

export default partyApi;