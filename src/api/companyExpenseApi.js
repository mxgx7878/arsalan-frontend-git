import API from "./axios";

const companyExpenseApi = {
  getAll: (params) => API.get("/company-expenses", { params }),
  getById: (id) => API.get(`/company-expenses/${id}`),
  create: (data) => API.post("/company-expenses", data),
  update: (id, data) => API.put(`/company-expenses/${id}`, data),
  delete: (id) => API.delete(`/company-expenses/${id}`),
  statistics: (params) => API.get("/company-expenses/statistics", { params }),
};

export default companyExpenseApi;