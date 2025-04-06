import { authService } from './auth';
import { taskService } from './tasks';
import { submissionService } from './submissions';
import { progressService } from './progress';

export const api = {
  auth: authService,
  tasks: taskService,
  submissions: submissionService,
  progress: progressService,
};

export default api;
