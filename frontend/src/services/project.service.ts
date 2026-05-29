import { api } from '../lib/api';

export const projectService = {
  getProjects: async (userId: string) => {
    return api.get(`/projects/${userId}`);
  },

  createProject: async (data: any) => {
    return api.post('/projects/create', data);
  },

  updateProject: async (projectId: string, data: any) => {
    return api.put(`/projects/update/${projectId}`, data);
  },

  deleteProject: async (projectId: string) => {
    return api.delete(`/projects/delete/${projectId}`);
  },

  toggleVisibility: async (projectId: string) => {
    return api.put(`/projects/toggle-visibility/${projectId}`);
  },

  toggleFeatured: async (projectId: string) => {
    return api.put(`/projects/toggle-featured/${projectId}`);
  },

  syncGithubProjects: async () => {
    return api.post('/projects/sync-github');
  },

  getPublicPortfolio: async (username: string) => {
    return api.get(`/projects/public/${username}`);
  },

  getExploreProjects: async () => {
    return api.get('/projects/public/all/explore');
  },

  addProjectRating: async (projectId: string, data: { rating: number; comment: string; username: string; userAvatar?: string }) => {
    return api.post(`/projects/rate/${projectId}`, data);
  },

  toggleProjectLike: async (projectId: string) => {
    return api.post(`/projects/like/${projectId}`);
  }
};
