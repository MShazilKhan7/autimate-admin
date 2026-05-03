import api from "@/utils/api";

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  isVerified: boolean;
  createdAt: string;
}

export const usersAPI = {
  getAll: () => api.get("/api/users").then(res => res.data),
  getOne: (id: string) => api.get(`/api/users/${id}`).then(res => res.data),
  update: (id: string, data: Partial<User>) => api.put(`/api/users/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/api/users/${id}`).then(res => res.data),
};
