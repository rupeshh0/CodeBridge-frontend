import { supabase } from '@/lib/supabase';
import { User } from '@/lib/context/auth-context';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<User | null> => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      if (!authData.user) {
        return null;
      }

      // Get user profile from the profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      return {
        id: authData.user.id,
        email: authData.user.email || '',
        username: profileData?.username || '',
        full_name: profileData?.full_name,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<void> => {
    try {
      // Register the user with Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      if (!authData.user) {
        throw new Error('User registration failed');
      }

      // Create a profile in the profiles table
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          username: data.username,
          full_name: data.full_name,
          email: data.email,
        },
      ]);

      if (profileError) {
        throw profileError;
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        return null;
      }

      // Get user profile from the profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      return {
        id: authData.user.id,
        email: authData.user.email || '',
        username: profileData?.username || '',
        full_name: profileData?.full_name,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  },
};
