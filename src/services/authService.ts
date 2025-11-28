import { createClient } from '@supabase/supabase-js';
import { User, UserRole } from '../models/User';
import { AppError } from '../utils/errorHandler';
import { profileService } from './profileService';
import { supporterService } from './supporterService';

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

    if (data.user) {
      try {
        await profileService.createProfile(data.user.id, userData.role, userData.name);

        if (userData.role === UserRole.SUPPORT_AGENT) {
          await supporterService.createSupporter(data.user.id, null, userData.name);
        }
      } catch (profileError: any) {
        // If profile creation fails, we might want to rollback user creation or just log it.
        // For now, let's throw an error so the user knows something went wrong.
        throw new AppError('Failed to create user profile: ' + profileError.message, 500);
      }
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
    try {
      const profile = await profileService.getProfileById(userId);
      return profile?.profile_type === requiredRole;
    } catch (error) {
      return false;
    }
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
