import API from "./axios";

const expenseCategoryApi = {
  getAll: (params) => API.get("/expense-categories", { params }),
  getById: (id) => API.get(`/expense-categories/${id}`),
  create: (data) => API.post("/expense-categories", data),
  update: (id, data) => API.put(`/expense-categories/${id}`, data),
  delete: (id) => API.delete(`/expense-categories/${id}`),
  toggleActive: (id) => API.put(`/expense-categories/${id}/toggle-active`),
};

export default expenseCategoryApi;