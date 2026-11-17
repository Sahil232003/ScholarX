import { Request, Response, NextFunction } from 'express';
import { db } from '../database/mock-db';
import { AuthUser, UserRole } from '../models';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ success: false, error: 'Authentication required. Authorization header missing.' });
    return;
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    res.status(401).json({ success: false, error: 'Invalid token format.' });
    return;
  }

  // Token format: "mock-token-<userId>" or plain userId or JWT-like string
  let userId = '';
  if (token.startsWith('mock-token-')) {
    userId = token.replace('mock-token-', '');
  } else {
    userId = token;
  }

  const account = db.findUserById(userId) || db.accounts.find(u => u.email === userId);
  if (!account) {
    // If not found, check if it's admin master token
    if (token === 'admin-master-token') {
      const adminAcc = db.accounts.find(u => u.role === 'ADMIN');
      if (adminAcc) {
        const { passwordHash, ...cleanUser } = adminAcc;
        req.user = cleanUser;
        next();
        return;
      }
    }
    res.status(401).json({ success: false, error: 'Session expired or user account not found.' });
    return;
  }

  const { passwordHash, ...cleanUser } = account;
  req.user = cleanUser;
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden. Role '${req.user.role}' is not authorized. Required: [${roles.join(', ')}]`
      });
      return;
    }

    next();
  };
}

export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next();
    return;
  }
  authenticate(req, res, () => next());
}
