import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../auth-context';
import api from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  auth: {
    isAuthenticated: jest.fn(),
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isLoading, isAuthenticated, login, register, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <button data-testid="login" onClick={() => login('test@example.com', 'password')}>Login</button>
      <button data-testid="register" onClick={() => register('test@example.com', 'testuser', 'password')}>Register</button>
      <button data-testid="logout" onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('provides the auth context to children', async () => {
    // Mock the API to return not authenticated
    api.auth.isAuthenticated.mockReturnValue(false);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initially loading
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Should not be authenticated
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });
  
  it('loads the user when authenticated', async () => {
    // Mock the API to return authenticated and a user
    api.auth.isAuthenticated.mockReturnValue(true);
    api.auth.getCurrentUser.mockResolvedValue({
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Should be authenticated with user data
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(JSON.parse(screen.getByTestId('user').textContent)).toEqual({
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
    });
  });
  
  it('handles login correctly', async () => {
    // Mock the API
    api.auth.isAuthenticated.mockReturnValue(false);
    api.auth.login.mockResolvedValue({ access_token: 'token123' });
    api.auth.getCurrentUser.mockResolvedValue({
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Click login button
    await act(async () => {
      screen.getByTestId('login').click();
    });
    
    // Should call login with correct params
    expect(api.auth.login).toHaveBeenCalledWith({
      username: 'test@example.com',
      password: 'password',
    });
    
    // Wait for login to complete
    await waitFor(() => {
      expect(api.auth.getCurrentUser).toHaveBeenCalled();
    });
  });
  
  it('handles logout correctly', async () => {
    // Mock the API
    api.auth.isAuthenticated.mockReturnValue(true);
    api.auth.getCurrentUser.mockResolvedValue({
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Click logout button
    await act(async () => {
      screen.getByTestId('logout').click();
    });
    
    // Should call logout
    expect(api.auth.logout).toHaveBeenCalled();
  });
});
