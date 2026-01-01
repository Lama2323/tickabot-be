import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach user to request for downstream use
    req.user = user;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const checkRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Check user_type in the public 'user' table
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('user_type')
        .eq('user_id', req.user.id)
        .single();

      if (userError || !userData) {
        return res.status(403).json({ message: 'User profile not found' });
      }

      if (!allowedRoles.includes(userData.user_type)) {
        return res.status(403).json({ message: `Access denied. Requires one of: ${allowedRoles.join(', ')}` });
      }

      next();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
};

// Start of Selection
// Pre-configured middlewares
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  await verifyToken(req, res, async () => {
    await checkRole(['admin'])(req, res, next);
  });
};

export const isSupporter = async (req: Request, res: Response, next: NextFunction) => {
  await verifyToken(req, res, async () => {
    await checkRole(['supporter', 'support_agent', 'admin'])(req, res, next); // Admins can usually act as supporters too
  });
};
