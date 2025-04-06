import { supabase } from '@/lib/supabase';

export interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string[];
  languages: string[];
  initial_code: Record<string, string>;
  test_cases: {
    input: string;
    expected_output: string;
  }[];
  solution: Record<string, string>;
  hints: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  code: string;
  language: string;
  status: 'pending' | 'success' | 'failed';
  execution_time: number;
  memory_used: number;
  created_at: string;
}

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get tasks error:', error);
      throw error;
    }
  },

  getTaskById: async (id: string): Promise<Task | null> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Get task ${id} error:`, error);
      throw error;
    }
  },

  submitTask: async (submission: Omit<TaskSubmission, 'id' | 'created_at'>): Promise<TaskSubmission> => {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .insert([submission])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Submit task error:', error);
      throw error;
    }
  },

  getUserSubmissions: async (userId: string): Promise<TaskSubmission[]> => {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Get user ${userId} submissions error:`, error);
      throw error;
    }
  },

  getTaskSubmissions: async (taskId: string): Promise<TaskSubmission[]> => {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Get task ${taskId} submissions error:`, error);
      throw error;
    }
  },
};
