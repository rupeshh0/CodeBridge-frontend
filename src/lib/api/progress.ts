import apiClient from './client';

export interface UserProgress {
  user_id: string;
  task_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  best_submission_id?: string;
  attempts: number;
  last_attempt_at?: string;
  completed_at?: string;
}

export interface UserStats {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  completion_rate: number;
  total_attempts: number;
}

export interface LeaderboardEntry {
  username: string;
  completed_at: string;
  execution_time: number;
  memory_used: number;
}

export const progressService = {
  getUserProgress: async (): Promise<UserProgress[]> => {
    const response = await apiClient.get<UserProgress[]>('/progress');
    return response.data;
  },
  
  getTaskProgress: async (taskId: string): Promise<UserProgress> => {
    const response = await apiClient.get<UserProgress>(`/progress/${taskId}`);
    return response.data;
  },
  
  getUserStats: async (): Promise<UserStats> => {
    const response = await apiClient.get<UserStats>('/progress/stats');
    return response.data;
  },
  
  getTaskLeaderboard: async (taskId: string, limit: number = 10): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get<LeaderboardEntry[]>(`/progress/leaderboard/${taskId}`, {
      params: { limit },
    });
    return response.data;
  },
};
