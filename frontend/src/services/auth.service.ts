import { api } from '../lib/api';

export const authService = {
  // Sync Clerk user to backend database
  syncUser: async (userData: any) => {
    return api.post('/auth/sync', userData);
  },

  // Verify custom JWT
  verifySession: async () => {
    return api.get('/auth/verify');
  },

  // Custom login (if moving away from Clerk in the future)
  login: async (credentials: any) => {
    return api.post('/auth/login', credentials);
  },
};
