import api from "@/utils/api";

export interface PracticeItem {
  id?: string;
  text: string;
  type: "letter" | "word" | "sentence";
  hint: string;
  emoji?: string;
}

export interface SpeechSpaceLevel {
  _id?: string;
  levelNumber: number;
  name: string;
  description: string;
  icon: string;
  starsRequired: number;
  items: PracticeItem[];
}

export const spaceAPI = {
  getAll: () => api.get("/api/speech-space").then(res => res.data),
  create: (data: SpeechSpaceLevel) => api.post("/api/speech-space", data).then(res => res.data),
  update: (id: string, data: Partial<SpeechSpaceLevel>) => api.put(`/api/speech-space/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/api/speech-space/${id}`).then(res => res.data),
};
