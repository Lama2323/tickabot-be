import { supabase, supabaseAdmin } from '../utils/supabase';
import { UserRole } from '../models/User';
import { userService } from './userService';

export const supporterService = {
  getAllSupporters: async () => {
    const { data, error } = await supabase
      .from('supporter')
      .select('*');
    if (error) throw error;
    return data;
  },

  getSupporterById: async (supporter_id: string) => {
    const { data, error } = await supabase
      .from('supporter')
      .select('*')
      .eq('supporter_id', supporter_id)
      .single();
    if (error) throw error;
    return data;
  },

  createSupporter: async (supporter_id: string, team_id: string | null, supporter_name: string, user_id?: string) => {
    const { data, error } = await supabase
      .from('supporter')
      .insert([{
        supporter_id,
        team_id,
        supporter_name,
        user_id
      }])
      .select();
    if (error) throw error;
    return data;
  },

  updateSupporter: async (supporter_id: string, team_id: string, supporter_name: string, user_id?: string) => {
    const { data, error } = await supabase
      .from('supporter')
      .update({ team_id, supporter_name, user_id })
      .eq('supporter_id', supporter_id)
      .select();
    if (error) throw error;
    return data;
  },

  deleteSupporter: async (supporter_id: string) => {
    const { error } = await supabase
      .from('supporter')
      .delete()
      .eq('supporter_id', supporter_id);
    if (error) throw error;
    return;
  },

  addSupporterWithAuth: async (email: string, supporter_name: string, password: string, team_id: string | null) => {
    if (!supabaseAdmin) {
      throw new Error('Supabase Admin client not initialized');
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: supporter_name, role: UserRole.SUPPORT_AGENT }
    });

    if (authError) throw authError;
    const userId = authData.user.id;

    try {
      await userService.createUser(userId, UserRole.SUPPORT_AGENT, supporter_name);

      const { data: supporterData, error: supporterError } = await supabase
        .from('supporter')
        .insert([{
          team_id,
          supporter_name,
          user_id: userId
        }])
        .select();

      if (supporterError) throw supporterError;
      return supporterData;
    } catch (error) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw error;
    }
  }
};