import { api } from '../lib/api';

export const profileService = {
  // Update Profile Data
  updateProfile: async (profileData: any) => {
    return api.post('/profile/update', profileData);
  },

  // Get Profile Data
  getProfile: async (userId: string) => {
    return api.get(`/profile/${userId}`);
  },

  // Create Project
  createProject: async (projectData: any) => {
    return api.post('/projects/create', projectData);
  },

  // Get Projects
  getProjects: async (userId: string) => {
    return api.get(`/projects/${userId}`);
  }
};
