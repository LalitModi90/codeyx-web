import { api } from '../lib/api';

export const profileService = {
  // Update Profile Data
  updateProfile: async (profileData: any) => {
    return api.post('/profile/update', profileData);
  },

  // Get Profile Data
  getProfile: async (userId: string, token: string | null = null) => {
    return api.get(`/profile/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // Create Project
  createProject: async (projectData: any) => {
    return api.post('/projects/create', projectData);
  },

  // Get Projects
  getProjects: async (userId: string) => {
    return api.get(`/projects/${userId}`);
  },

  // Follow another user
  followUser: async (payload: { userId: string; followingId: string }) => {
    return api.post('/social/follow', payload);
  }
};
