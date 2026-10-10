import { userRepository } from '../repositories/user.repository';

export class ProfileService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }
    return user;
  }

  async updateProfile(userId: string, data: {
    name?: string;
    phone?: string;
    dateOfBirth?: string | null;
    gender?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
  }) {
    return userRepository.update(userId, {
      ...(data.name && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.dateOfBirth !== undefined && {
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      }),
      ...(data.gender !== undefined && { gender: data.gender }),
      ...(data.emergencyContactName !== undefined && { emergency_contact_name: data.emergencyContactName }),
      ...(data.emergencyContactPhone !== undefined && { emergency_contact_phone: data.emergencyContactPhone }),
    });
  }
}

export const profileService = new ProfileService();
