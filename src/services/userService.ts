import { supabase } from '../utils/supabase';

export const userService = {
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('user')
      .select('*');
    if (error) throw error;
    return data;
  },

  getUserById: async (user_id: string) => {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('user_id', user_id)
      .single();
    if (error) throw error;
    return data;
  },

  createUser: async (user_id: string, user_type: string, user_name: string) => {
    const { data, error } = await supabase
      .from('user')
      .insert([{
        user_id,
        user_type,
        user_name
      }])
      .select();
    if (error) throw error;
    return data;
  },

  updateUser: async (user_id: string, user_type: string, user_name: string) => {
    const { data, error } = await supabase
      .from('user')
      .update({
        user_type,
        user_name
      })
      .eq('user_id', user_id)
      .select();
    if (error) throw error;
    return data;
  },

  deleteUser: async (user_id: string) => {
    const { error } = await supabase
      .from('user')
      .delete()
      .eq('user_id', user_id);
    if (error) throw error;
    return;
  },
};