import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthUser } from '../types';

export function signToken(user: AuthUser): string {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as any }
  );
}

export function verifyToken(token: string): any {
  return jwt.verify(token, config.jwtSecret);
}
