import { api } from '../lib/api';

export const activityService = {
  // Fetch activity feed for the logged-in user
  getActivityFeed: async () => {
    return api.get('/activity');
  },
};
