import api from "@/utils/api";

export interface SocialSkill {
  _id?: string;
  task: string;
  image: string;
  description: string;
  instruction: string;
  category: string;
}

export const socialAPI = {
  getAll: () => api.get("/api/social-skills").then(res => res.data),
  create: (data: SocialSkill) => api.post("/api/social-skills", data).then(res => res.data),
  update: (id: string, data: Partial<SocialSkill>) => api.put(`/api/social-skills/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/api/social-skills/${id}`).then(res => res.data),
};
