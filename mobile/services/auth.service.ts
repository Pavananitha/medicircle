import { authService, AuthService as BaseAuthService } from './authService';
import { apiClient } from './api';
import { Storage } from '../utils/storage';
import { User } from '../types/auth';

export { authService };

export const AuthService = {
  ...BaseAuthService,
  async register(data: any): Promise<{ user: User; token: string }> {
    const res = await apiClient.post('/auth/register', data);
    const { user, token } = res.data;
    await Storage.setToken(token);
    await Storage.setUser(user);
    return { user, token };
  },
  async getMe(): Promise<User> {
    const res = await apiClient.get('/auth/me');
    const user = res.data.user || res.data;
    await Storage.setUser(user);
    return user;
  },
  async updateProfile(data: any): Promise<User> {
    const res = await apiClient.put('/profile', data);
    const user = res.data.data || res.data.user || res.data;
    await Storage.setUser(user);
    return user;
  },
  async forgotPassword(email: string): Promise<{ message: string; otp?: string }> {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },
  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const res = await apiClient.post('/auth/reset-password', { email, code, newPassword });
    return res.data;
  },
};


export default AuthService;
