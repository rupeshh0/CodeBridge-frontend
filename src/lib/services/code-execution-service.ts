import axios from 'axios';

export interface CodeExecutionRequest {
  code: string;
  language: string;
  input?: string;
}

export interface CodeExecutionResponse {
  output: string;
  error?: string;
  execution_time: number;
  memory_used: number;
}

export const codeExecutionService = {
  executeCode: async (request: CodeExecutionRequest): Promise<CodeExecutionResponse> => {
    try {
      const response = await axios.post<CodeExecutionResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/execute-code`,
        request
      );
      
      return response.data;
    } catch (error) {
      console.error('Code execution error:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as CodeExecutionResponse;
      }
      
      return {
        output: '',
        error: 'Failed to execute code. Please try again later.',
        execution_time: 0,
        memory_used: 0,
      };
    }
  },
  
  // Mock implementation for development
  mockExecuteCode: async (request: CodeExecutionRequest): Promise<CodeExecutionResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { code, language, input } = request;
    
    // Generate mock output based on language and code
    let output = '';
    let error = undefined;
    let executionTime = Math.random() * 0.5; // Random execution time between 0 and 0.5 seconds
    let memoryUsed = Math.floor(Math.random() * 10000); // Random memory usage between 0 and 10000 KB
    
    if (language === 'python') {
      if (code.includes('print')) {
        output = 'Hello, World!\n';
        if (input) {
          output += `Input: ${input}\n`;
        }
      } else if (code.includes('syntax error')) {
        error = 'SyntaxError: invalid syntax';
        output = '';
      } else {
        output = 'Code executed successfully.\n';
      }
    } else if (language === 'javascript') {
      if (code.includes('console.log')) {
        output = 'Hello, World!\n';
        if (input) {
          output += `Input: ${input}\n`;
        }
      } else if (code.includes('syntax error')) {
        error = 'SyntaxError: Unexpected token';
        output = '';
      } else {
        output = 'Code executed successfully.\n';
      }
    } else if (language === 'java') {
      if (code.includes('System.out.println')) {
        output = 'Hello, World!\n';
        if (input) {
          output += `Input: ${input}\n`;
        }
      } else if (code.includes('syntax error')) {
        error = 'error: \';\' expected';
        output = '';
      } else {
        output = 'Code executed successfully.\n';
      }
    } else if (language === 'cpp') {
      if (code.includes('cout')) {
        output = 'Hello, World!\n';
        if (input) {
          output += `Input: ${input}\n`;
        }
      } else if (code.includes('syntax error')) {
        error = 'error: expected \';\' before \'}\'';
        output = '';
      } else {
        output = 'Code executed successfully.\n';
      }
    } else {
      output = 'Language not supported for mock execution.';
    }
    
    return {
      output,
      error,
      execution_time: executionTime,
      memory_used: memoryUsed,
    };
  },
};
