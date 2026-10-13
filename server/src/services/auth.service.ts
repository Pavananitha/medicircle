import { IUserRepository, userRepository } from '../repositories/user.repository';
import { comparePassword, hashPassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { AuthUser, LoginResponse } from '../types';
import { prisma } from '../config/prisma';

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
      phone: userRecord.phone,
      date_of_birth: userRecord.date_of_birth,
      gender: userRecord.gender,
      emergency_contact_name: userRecord.emergency_contact_name,
      emergency_contact_phone: userRecord.emergency_contact_phone,
      profile_image_url: userRecord.profile_image_url,
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
      phone: userRecord.phone,
      date_of_birth: userRecord.date_of_birth,
      gender: userRecord.gender,
      emergency_contact_name: userRecord.emergency_contact_name,
      emergency_contact_phone: userRecord.emergency_contact_phone,
      profile_image_url: userRecord.profile_image_url,
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
      phone: userRecord.phone,
      date_of_birth: userRecord.date_of_birth,
      gender: userRecord.gender,
      emergency_contact_name: userRecord.emergency_contact_name,
      emergency_contact_phone: userRecord.emergency_contact_phone,
      profile_image_url: userRecord.profile_image_url,
    };
  }

  async forgotPassword(email: string): Promise<{ message: string; otp: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepo.findByEmail(normalizedEmail);
    if (!user) {
      throw new Error('No account found with this email address.');
    }

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Invalidate any previous unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        user_id: user.id,
        used_at: null,
      },
      data: {
        used_at: new Date(),
      },
    });

    // Save new token
    await prisma.passwordResetToken.create({
      data: {
        user_id: user.id,
        code,
        expires_at: expiresAt,
      },
    });

    console.log(`\n======================================================`);
    console.log(`[AUTH] 🔑 Password reset verification code for ${normalizedEmail}: ${code}`);
    console.log(`======================================================\n`);

    return {
      message: 'Verification code generated! Please enter the 6-digit code to reset your password.',
      otp: code,
    };
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepo.findByEmail(normalizedEmail);
    if (!user) {
      throw new Error('No account found with this email address.');
    }

    // Find active valid token
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        user_id: user.id,
        code: code.trim(),
        used_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (!tokenRecord) {
      throw new Error('Invalid or expired verification code. Please request a new code.');
    }

    // Hash the new password
    const password_hash = await hashPassword(newPassword);

    // Update user password in repository
    await this.userRepo.update(user.id, { password_hash });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { used_at: new Date() },
    });

    console.log(`[AUTH] ✅ Password successfully reset for ${normalizedEmail}`);

    return {
      message: 'Your password has been successfully reset! You can now log in with your new password.',
    };
  }
}

export const authService = new AuthService();
