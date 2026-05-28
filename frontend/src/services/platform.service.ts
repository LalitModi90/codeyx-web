import { api } from '../lib/api';

export const platformService = {
  // Trigger a background sync job
  syncPlatform: async (platform: string, userId: string, platformUsername?: string) => {
    return api.post('/platforms/sync', { platform, userId, platformUsername });
  },

  // Fetch the latest stats directly (to be used with React Query)
  getPlatformStats: async (platform: string, userId: string) => {
    return api.get(`/platforms/stats?platform=${platform}&userId=${userId}`);
  },

  connectPlatform: async (userId: string, platform: string, platformUsername: string) => {
    return api.post('/platforms/sync', { platform, userId, platformUsername });
  },

  getAllPlatformStats: async (userId: string) => {
    return api.get(`/platforms/all?userId=${userId}`);
  },

  disconnectPlatform: async (platform: string, userId: string) => {
    return api.post('/platforms/disconnect', { platform, userId });
  }
};
