import { supabase } from '../utils/supabase';

export const profileService = {
  getAllProfiles: async () => {
    const { data, error } = await supabase
      .from('profile')
      .select('*');
    if (error) throw error;
    return data;
  },

  getProfileById: async (profile_id: string) => {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('profile_id', profile_id)
      .single();
    if (error) throw error;
    return data;
  },

  createProfile: async (profile_id: string, profile_type: string, profile_name: string) => {
    const { data, error } = await supabase
      .from('profile')
      .insert([{
        profile_id,
        profile_type,
        profile_name
      }])
      .select();
    if (error) throw error;
    return data;
  },

  updateProfile: async (profile_id: string, profile_type: string, profile_name: string) => {
    const { data, error } = await supabase
      .from('profile')
      .update({
        profile_type,
        profile_name
      })
      .eq('profile_id', profile_id)
      .select();
    if (error) throw error;
    return data;
  },

  deleteProfile: async (profile_id: string) => {
    const { error } = await supabase
      .from('profile')
      .delete()
      .eq('profile_id', profile_id);
    if (error) throw error;
    return;
  },
};