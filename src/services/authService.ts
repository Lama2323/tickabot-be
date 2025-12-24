import { supabase } from '../utils/supabase';
import { UserRole } from '../models/User';
import { AppError } from '../utils/errorHandler';
import { userService } from './userService';

interface ILoginCredentials {
  email: string;
  password: string;
}

interface IAuthResponse {
  user: any; // Supabase user object
  session: any; // Supabase session
}

export class AuthService {
  async signUp(credentials: ILoginCredentials, userData: { name: string }) {
    const role = UserRole.USER;
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: userData.name,
          role: role
        }
      }
    });

    if (error) {
      console.error('Supabase Auth SignUp Error:', error);
      throw new AppError(error.message, 400);
    }

    console.log('Supabase Auth SignUp Success:', data.user?.id);

    if (data.user) {
      try {
        console.log('Attempting to create user profile in DB for ID:', data.user.id);
        const result = await userService.createUser(data.user.id, role, userData.name);
        console.log('User profile created successfully:', result);
      } catch (userError: any) {
        console.error('Database Profile Creation Error:', userError);
        throw new AppError('Failed to create user profile: ' + userError.message, 500);
      }
    }

    return data;
  }

  async login(credentials: ILoginCredentials): Promise<any> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('Supabase Login Error:', error.message);
      throw new AppError(error.message, 401);
    }

    try {
      // Fetch profile to get role
      const profile = await userService.getUserById(data.user.id);
      let supporterProfile = null;
      if (profile.user_type === UserRole.SUPPORT_AGENT) {
        const { data: sData, error: sError } = await supabase
          .from('supporter')
          .select('*')
          .eq('user_id', data.user.id)
          .single();
        if (sError) {
          console.warn('Supporter profile not found for agent:', data.user.id);
        }
        supporterProfile = sData;
      }

      return {
        ...data,
        token: data.session?.access_token,
        user: {
          ...data.user,
          role: profile.user_type,
          name: profile.user_name,
          profile,
          supporter: supporterProfile,
          supporter_id: supporterProfile?.supporter_id,
          team_id: supporterProfile?.team_id
        }
      };
    } catch (profileError: any) {
      console.error('Error fetching user profile during login:', profileError);
      // Even if profile fetching fails, we have the auth data, 
      // but the app expects profile data, so we might want to throw or return partial data.
      // For now, let's return what we have but with a warning.
      return {
        ...data,
        token: data.session?.access_token,
        user: {
          ...data.user,
          role: UserRole.USER, // Default to USER if profile not found
          name: data.user.user_metadata?.name || 'User'
        }
      };
    }
  }

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
      const profile = await userService.getUserById(user.id);
      let supporterProfile = null;
      if (profile.user_type === UserRole.SUPPORT_AGENT) {
        const { data: sData } = await supabase
          .from('supporter')
          .select('*')
          .eq('user_id', user.id)
          .single();
        supporterProfile = sData;
      }

      return {
        ...user,
        role: profile.user_type,
        name: profile.user_name,
        profile,
        supporter: supporterProfile,
        supporter_id: supporterProfile?.supporter_id,
        team_id: supporterProfile?.team_id,
        user_id: user.id
      };
    } catch (e) {
      return user;
    }
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
      const user = await userService.getUserById(userId);
      return user?.user_type === requiredRole;
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
