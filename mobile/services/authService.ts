import apiClient from './api';
import { Storage } from '../utils/storage';
import { AuthResponse, User, LoginCredentials } from '../types/auth';

export const authService = {
  /**
   * Log in user with email and password
   * Calls POST /api/auth/login
   * Expects: { user: { id, name, email, role }, token }
   */
  async login(emailOrCreds: string | LoginCredentials, maybePassword?: string): Promise<AuthResponse> {
    let email: string;
    let password: string;

    if (typeof emailOrCreds === 'object') {
      email = emailOrCreds.email;
      password = emailOrCreds.password;
    } else {
      email = emailOrCreds;
      password = maybePassword || '';
    }

    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    const { user, token } = response.data;

    // Securely store token in Expo SecureStore (never logs or exposes token)
    await Storage.setToken(token);
    // Store only minimal safe user info (never password_hash)
    await Storage.setUser(user);

    return { user, token };
  },

  /**
   * Register a new user
   * Calls POST /api/auth/register
   * Expects: { user: { id, name, email, role }, token }
   */
  async register(credentials: import('../types/auth').RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      name: credentials.name.trim(),
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
      role: credentials.role,
    });

    const { user, token } = response.data;

    // Securely store token in Expo SecureStore (never logs or exposes token)
    await Storage.setToken(token);
    // Store only minimal safe user info (never password_hash)
    await Storage.setUser(user);

    return { user, token };
  },

  /**
   * Log out current user and clear tokens from SecureStore
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      await Storage.clearAuth();
    }
  },

  /**
   * Hydrate or fetch current user
   */
  async getCurrentUser(): Promise<User | null> {
    return Storage.getUser();
  },

  /**
   * Retrieve JWT from SecureStore
   */
  async getToken(): Promise<string | null> {
    return Storage.getToken();
  },
};

export const AuthService = authService;
export default authService;
