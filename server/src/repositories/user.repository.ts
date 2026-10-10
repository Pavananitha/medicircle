import { prisma } from '../config/prisma';
import { Role } from '../types';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  phone?: string;
  date_of_birth?: Date | null;
  gender?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  profile_image_url?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  update(id: string, data: Partial<UserRecord>): Promise<UserRecord | null>;
  create(data: Omit<UserRecord, 'id' | 'created_at' | 'updated_at'>): Promise<UserRecord>;
}

/**
 * Real PostgreSQL User Repository using Prisma ORM.
 * Connects to the existing PostgreSQL 'users' table in 'medicircle' database.
 */
export class PrismaUserRepository implements IUserRepository {
  async create(data: Omit<UserRecord, 'id' | 'created_at' | 'updated_at'>): Promise<UserRecord> {
    const normalized = data.email.toLowerCase().trim();
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: normalized,
        password_hash: data.password_hash,
        role: data.role,
      },
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.password_hash,
      role: user.role as Role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const normalized = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalized },
    });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.password_hash,
      role: user.role as Role,
      phone: user.phone || undefined,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      emergency_contact_name: user.emergency_contact_name,
      emergency_contact_phone: user.emergency_contact_phone,
      profile_image_url: user.profile_image_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.password_hash,
      role: user.role as Role,
      phone: user.phone || undefined,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      emergency_contact_name: user.emergency_contact_name,
      emergency_contact_phone: user.emergency_contact_phone,
      profile_image_url: user.profile_image_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async update(id: string, data: Partial<UserRecord>): Promise<UserRecord | null> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.date_of_birth !== undefined && { date_of_birth: data.date_of_birth }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.emergency_contact_name !== undefined && { emergency_contact_name: data.emergency_contact_name }),
        ...(data.emergency_contact_phone !== undefined && { emergency_contact_phone: data.emergency_contact_phone }),
        ...(data.profile_image_url !== undefined && { profile_image_url: data.profile_image_url }),
      },
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.password_hash,
      role: user.role as Role,
      phone: user.phone || undefined,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      emergency_contact_name: user.emergency_contact_name,
      emergency_contact_phone: user.emergency_contact_phone,
      profile_image_url: user.profile_image_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}

// Active repository instance connected to PostgreSQL via Prisma
export const userRepository: IUserRepository = new PrismaUserRepository();
