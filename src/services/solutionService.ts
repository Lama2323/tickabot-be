import { supabase } from '../utils/supabase';

export const solutionService = {
  createSolution: async (
    team_id: string,
    ticket_id: string,
    problem: string,
    solution: string
  ) => {
    const { data, error } = await supabase
      .from('solution')
      .insert([{
        team_id,
        ticket_id,
        problem,
        solution
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getSolutionsByTeam: async (team_id: string) => {
    const { data, error } = await supabase
      .from('solution')
      .select('*')
      .eq('team_id', team_id)
      .order('created_at', { ascending: false }); // Newest first

    if (error) throw error;
    return data || [];
  },
};
