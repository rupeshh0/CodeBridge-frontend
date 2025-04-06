import { supabase } from '@/lib/supabase';
import { User } from '@/lib/context/auth-context';

export interface UserProfile extends User {
  bio?: string;
  avatar_url?: string;
  website?: string;
  social_links?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  skills?: string[];
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  completed_tasks?: number;
  points?: number;
  badges?: string[];
  updated_at?: string;
}

export interface UserStats {
  total_submissions: number;
  successful_submissions: number;
  failed_submissions: number;
  total_points: number;
  rank: number;
  completed_tasks_by_difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  completed_tasks_by_category: Record<string, number>;
  activity_by_day: Record<string, number>;
}

export const userService = {
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Get user ${userId} profile error:`, error);
      throw error;
    }
  },

  updateUserProfile: async (userId: string, profile: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Update user ${userId} profile error:`, error);
      throw error;
    }
  },

  getUserStats: async (userId: string): Promise<UserStats> => {
    try {
      // This would typically be a single API call to a function that calculates all stats
      // For Supabase, we might need multiple queries or a stored procedure
      
      // For now, return mock data
      return {
        total_submissions: 42,
        successful_submissions: 35,
        failed_submissions: 7,
        total_points: 1250,
        rank: 15,
        completed_tasks_by_difficulty: {
          easy: 20,
          medium: 12,
          hard: 3,
        },
        completed_tasks_by_category: {
          'algorithms': 15,
          'data-structures': 10,
          'web-development': 5,
          'databases': 5,
        },
        activity_by_day: {
          '2023-01-01': 3,
          '2023-01-02': 5,
          '2023-01-03': 2,
          '2023-01-04': 0,
          '2023-01-05': 4,
        },
      };
    } catch (error) {
      console.error(`Get user ${userId} stats error:`, error);
      throw error;
    }
  },

  getLeaderboard: async (limit: number = 10, offset: number = 0): Promise<UserProfile[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw error;
    }
  },
};
