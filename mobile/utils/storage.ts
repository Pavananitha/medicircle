import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User } from '../types/auth';

const TOKEN_KEY = 'medicircle_access_token';
const USER_KEY = 'medicircle_user';

// In-memory / localStorage fallback for web development
const webStorage = {
  getItem: (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {}
    return null;
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {}
  },
  deleteItem: (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
  },
};

export const Storage = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return webStorage.getItem(TOKEN_KEY);
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async setToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      webStorage.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async removeToken(): Promise<void> {
    if (Platform.OS === 'web') {
      webStorage.deleteItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async getUser(): Promise<User | null> {
    let json: string | null = null;
    if (Platform.OS === 'web') {
      json = webStorage.getItem(USER_KEY);
    } else {
      json = await SecureStore.getItemAsync(USER_KEY);
    }
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    const json = JSON.stringify(user);
    if (Platform.OS === 'web') {
      webStorage.setItem(USER_KEY, json);
      return;
    }
    await SecureStore.setItemAsync(USER_KEY, json);
  },

  async removeUser(): Promise<void> {
    if (Platform.OS === 'web') {
      webStorage.deleteItem(USER_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  async clearAuth(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  },
};
