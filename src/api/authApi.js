import API from "./axios";

const authApi = {
  login: (data) => API.post("/auth/login", data),
  logout: () => API.post("/auth/logout"),
  me: () => API.get("/auth/me"),
};

export default authApi;
