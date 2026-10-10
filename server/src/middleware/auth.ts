import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, Role } from '../types';
import { verifyToken } from '../utils/jwt';

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as {
      sub?: string;
      userId?: string;
      role: Role;
      email?: string;
      name?: string;
    };

    req.user = {
      id: decoded.sub || decoded.userId || '',
      role: decoded.role,
      email: decoded.email || '',
      name: decoded.name || '',
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
}

export function requireRole(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Requires role ${allowedRoles.join(' or ')}` });
    }

    next();
  };
}
