import { supabase } from '../utils/supabase';

export const supporterService = {
  getAllSupporters: async () => {
    const { data, error } = await supabase.from('supporter').select('*');
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

  createSupporter: async (team_id: string, supporter_name: string) => {
    const { data, error } = await supabase
      .from('supporter')
      .insert([{ team_id, supporter_name }])
      .select();
    if (error) throw error;
    return data;
  },

  updateSupporter: async (supporter_id: string, team_id: string, supporter_name: string) => {
    const { data, error } = await supabase
      .from('supporter')
      .update({ team_id, supporter_name })
      .eq('supporter_id', supporter_id)
      .select();
    if (error) throw error;
    return data;
  },

  deleteSupporter: async (supporter_id: string) => {
    const { error } = await supabase.from('supporter').delete().eq('supporter_id', supporter_id);
    if (error) throw error;
    return;
  },
};