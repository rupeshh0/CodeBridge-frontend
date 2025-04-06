import apiClient from './client';

export interface TestCase {
  id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  explanation?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string[];
  initial_code: Record<string, string>;
  supported_languages: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  is_published: boolean;
  test_cases: TestCase[];
}

export interface TaskFilters {
  difficulty?: string;
  category?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export const taskService = {
  getTasks: async (filters: TaskFilters = {}): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/tasks', { params: filters });
    return response.data;
  },
  
  getTask: async (id: string): Promise<Task> => {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },
  
  createTask: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'is_published'>): Promise<Task> => {
    const response = await apiClient.post<Task>('/tasks', task);
    return response.data;
  },
  
  updateTask: async (id: string, task: Partial<Task>): Promise<Task> => {
    const response = await apiClient.put<Task>(`/tasks/${id}`, task);
    return response.data;
  },
  
  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
