import { supabase } from '../utils/supabase';

export const agentService = {
  getAllAgents: async () => {
    const { data, error } = await supabase.from('agent').select('*');
    if (error) throw error;
    return data;
  },

  getAgentById: async (agent_id: string) => {
    const { data, error } = await supabase
      .from('agent')
      .select('*')
      .eq('agent_id', agent_id)
      .single();
    if (error) throw error;
    return data;
  },

  createAgent: async (team_id: string, agent_name: string) => {
    const { data, error } = await supabase
      .from('agent')
      .insert([{ team_id, agent_name }])
      .select();
    if (error) throw error;
    return data;
  },

  updateAgent: async (agent_id: string, team_id: string, agent_name: string) => {
    const { data, error } = await supabase
      .from('agent')
      .update({ team_id, agent_name })
      .eq('agent_id', agent_id)
      .select();
    if (error) throw error;
    return data;
  },

  deleteAgent: async (agent_id: string) => {
    const { error } = await supabase.from('agent').delete().eq('agent_id', agent_id);
    if (error) throw error;
    return;
  },
};