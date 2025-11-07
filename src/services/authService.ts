import { createClient } from '@supabase/supabase-js';
import { User, UserRole } from '../models/User';
import { AppError } from '../utils/errorHandler';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ILoginCredentials {
  email: string;
  password: string;
}

interface IAuthResponse {
  user: any; // Supabase user object
  session: any; // Supabase session
}

export class AuthService {
  async signUp(credentials: ILoginCredentials, userData: { name: string; role: UserRole }) {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: userData.name,
          role: userData.role
        }
      }
    });

    if (error) {
      throw new AppError(error.message, 400);
    }

    return data;
  }

  async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new AppError('Invalid credentials', 401);
    }

    return data;
  }

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new AppError('Error signing out', 400);
    }
  }

  // Middleware to check user role
  async checkUserRole(userId: string, requiredRole: UserRole): Promise<boolean> {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return false;
    }

    return user.role === requiredRole;
  }

  // Middleware to protect routes based on role
  async requireRole(requiredRole: UserRole) {
    return async (req: any, res: any, next: any) => {
      try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
          throw new AppError('No token provided', 401);
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
          throw new AppError('Invalid or expired token', 401);
        }

        const hasRole = await this.checkUserRole(user.id, requiredRole);
        
        if (!hasRole) {
          throw new AppError('Insufficient permissions', 403);
        }

        req.user = user;
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
