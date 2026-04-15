import api from './api';
import type {
  SignUpDto,
  SignInDto,
  AuthResponse,
  User,
  UpdateProfileDto,
} from '../types';

export const authService = {
  signUp: async (data: SignUpDto): Promise<string> => {
    const response = await api.post<string>('/auth/signup', data);
    return response.data;
  },

  signIn: async (data: SignInDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signin', data);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileDto): Promise<User> => {
    const response = await api.patch<User>('/auth/update/profile', data);
    return response.data;
  },

  getCurrentUser: (): User => {
    // We need to decode the JWT to get user info or add a /me endpoint
    // For now, we'll store user data after signup/signin
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData) as User;
    }
    throw new Error('User not found');
  },
};
