import { IUserRepository, userRepository } from '../repositories/user.repository';
import { comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { AuthUser, LoginResponse } from '../types';

export class AuthService {
  constructor(private userRepo: IUserRepository = userRepository) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const userRecord = await this.userRepo.findByEmail(email);
    if (!userRecord) {
      // Do not reveal whether email exists
      throw new Error('Invalid email or password');
    }

    const isMatch = await comparePassword(password, userRecord.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const user: AuthUser = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
    };

    const token = signToken(user);

    return {
      user,
      token,
    };
  }

  async register(data: import('../validators/auth.validator').RegisterInput): Promise<LoginResponse> {
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    const { hashPassword } = await import('../utils/hash');
    const hashedPassword = await hashPassword(data.password);

    const userRecord = await this.userRepo.create({
      name: data.name,
      email: data.email,
      password_hash: hashedPassword,
      role: data.role as import('../types').Role,
    });

    const user: AuthUser = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
    };

    const token = signToken(user);

    return {
      user,
      token,
    };
  }

  async getMe(userId: string): Promise<AuthUser> {
    const userRecord = await this.userRepo.findById(userId);
    if (!userRecord) {
      throw new Error('User not found');
    }
    return {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
    };
  }
}

export const authService = new AuthService();
