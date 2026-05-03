import api from "@/utils/api";

export interface SpeechTherapyWord {
  _id?: string;
  word: string;
  image: string;
  category: string;
  phonemes: string[];
  mockResponse?: any;
}

export const therapyAPI = {
  getAll: () => api.get("/api/speech-therapy").then(res => res.data),
  create: (data: SpeechTherapyWord) => api.post("/api/speech-therapy", data).then(res => res.data),
  update: (id: string, data: Partial<SpeechTherapyWord>) => api.put(`/api/speech-therapy/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/api/speech-therapy/${id}`).then(res => res.data),
};
