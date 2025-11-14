import { supabase } from '../utils/supabase';

export const teamService = {
  getAllTeams: async () => {
    const { data, error } = await supabase.from('team').select('*');
    if (error) throw error;
    return data;
  },

  getTeamById: async (team_id: string) => {
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .eq('team_id', team_id)
      .single();
    if (error) throw error;
    return data;
  },

  createTeam: async (team_name: string, team_description?: string) => {
    const { data, error } = await supabase
      .from('team')
      .insert([{ team_name, team_description }])
      .select();
    if (error) throw error;
    return data;
  },

  updateTeam: async (team_id: string, team_name: string, team_description: string) => {
    const { data, error } = await supabase
      .from('team')
      .update({ team_name, team_description })
      .eq('team_id', team_id)
      .select();
    if (error) throw error;
    return data;
  },

  deleteTeam: async (team_id: string) => {
    const { error } = await supabase.from('team').delete().eq('team_id', team_id);
    if (error) throw error;
    return;
  },
};