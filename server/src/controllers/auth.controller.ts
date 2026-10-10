import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      if (error.message === 'Email is already registered') {
        return res.status(409).json({ message: error.message });
      }
      console.error('Registration internal error:', error.message || error);
      return res.status(500).json({ message: 'Registration service temporarily unavailable. Please try again.' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      // Handle database or unexpected errors without exposing internals
      console.error('Authentication internal error:', error.message || error);
      return res.status(500).json({ message: 'Authentication service temporarily unavailable. Please try again.' });
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const user = await authService.getMe(req.user.id);
      return res.status(200).json({ user });
    } catch (error: any) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: 'User not found' });
      }
      console.error('Profile fetch error:', error.message || error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async logout(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({ message: 'Logged out successfully' });
  }
}

export const authController = new AuthController();
