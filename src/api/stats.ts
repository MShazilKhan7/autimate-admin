import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface DashboardStats {
  users: number;
  socialTasks: number;
  therapyWords: number;
  spaceLevels: number;
}

export const statsAPI = {
  getDashboardStats: async (): Promise<{ success: boolean; data: DashboardStats }> => {
    const response = await axios.get(`${API_URL}/stats/dashboard`, { withCredentials: true });
    return response.data;
  },
};
