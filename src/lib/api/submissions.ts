import apiClient from './client';

export interface TestResult {
  test_case_id: string;
  passed: boolean;
  output: string;
  error?: string;
  execution_time: number;
}

export interface Submission {
  id: string;
  task_id: string;
  user_id: string;
  code: string;
  language: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  execution_time?: number;
  memory_used?: number;
  created_at: string;
  results: TestResult[];
}

export interface SubmissionRequest {
  task_id: string;
  code: string;
  language: string;
}

export interface CodeExecutionRequest {
  code: string;
  language: string;
  test_input?: string;
}

export interface CodeExecutionResponse {
  output: string;
  error?: string;
  execution_time: number;
  memory_used?: number;
}

export const submissionService = {
  getSubmissions: async (taskId?: string): Promise<Submission[]> => {
    const params = taskId ? { task_id: taskId } : {};
    const response = await apiClient.get<Submission[]>('/submissions', { params });
    return response.data;
  },
  
  getSubmission: async (id: string): Promise<Submission> => {
    const response = await apiClient.get<Submission>(`/submissions/${id}`);
    return response.data;
  },
  
  createSubmission: async (submission: SubmissionRequest): Promise<Submission> => {
    const response = await apiClient.post<Submission>('/submissions', submission);
    return response.data;
  },
  
  executeCode: async (request: CodeExecutionRequest): Promise<CodeExecutionResponse> => {
    const response = await apiClient.post<CodeExecutionResponse>('/submissions/execute', request);
    return response.data;
  },
};
