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

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
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

    // Check user_type in the public 'user' table
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('user_type')
      .eq('user_id', user.id)
      .single();

    if (userError || !userData) {
      // It's possible the user exists in Auth but not in the public table yet
      return res.status(403).json({ message: 'User profile not found' });
    }

    if (userData.user_type !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    // Attach user to request for downstream use
    req.user = user;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
