import API from "./axios";

const invoiceApi = {
  getAll: (params) => API.get("/invoices", { params }),
  getById: (id) => API.get(`/invoices/${id}`),
  create: (data) => API.post("/invoices", data),
  update: (id, data) => API.put(`/invoices/${id}`, data),
  delete: (id) => API.delete(`/invoices/${id}`),
  markAsPaid: (id, data) => API.put(`/invoices/${id}/mark-as-paid`, data || {}),
  statistics: (params) => API.get("/invoices/statistics", { params }),
};

export default invoiceApi;