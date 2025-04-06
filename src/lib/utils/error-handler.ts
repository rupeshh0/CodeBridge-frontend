import { AxiosError } from 'axios';

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

/**
 * Formats an error from an API call into a standardized format
 */
export function formatApiError(error: any): ApiError {
  if (error instanceof AxiosError) {
    // Handle Axios errors
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || error.message || 'An unknown error occurred';
    const details = error.response?.data || {};
    
    return {
      status,
      message,
      details
    };
  } else if (error instanceof Error) {
    // Handle standard JS errors
    return {
      status: 500,
      message: error.message || 'An unknown error occurred'
    };
  } else {
    // Handle unknown errors
    return {
      status: 500,
      message: 'An unknown error occurred'
    };
  }
}

/**
 * Logs an error to the console in development and to a monitoring service in production
 */
export function logError(error: any, context?: string): void {
  const formattedError = formatApiError(error);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error${context ? ` in ${context}` : ''}:`, formattedError);
    console.error('Original error:', error);
  } else {
    // In production, we would send this to a monitoring service like Sentry
    // For now, just log to console
    console.error(`Error${context ? ` in ${context}` : ''}:`, formattedError);
  }
}

/**
 * Gets a user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: any): string {
  const formattedError = formatApiError(error);
  
  // Map specific error codes to user-friendly messages
  switch (formattedError.status) {
    case 400:
      return formattedError.message || 'The request was invalid. Please check your input.';
    case 401:
      return 'You need to log in to access this resource.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 404:
      return 'The requested resource was not found.';
    case 422:
      return 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'A server error occurred. Please try again later.';
    default:
      return formattedError.message || 'An unknown error occurred. Please try again.';
  }
}
