import { api } from '../lib/api';

export const userService = {
  getProfile: async (username: string) => {
    return api.get(`/users/${username}`);
  },

  updateProfile: async (data: any) => {
    return api.put('/users/profile', data);
  },

  getStats: async (username: string) => {
    return api.get(`/users/${username}/stats`);
  },
};
