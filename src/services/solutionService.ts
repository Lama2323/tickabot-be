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

  getAllSolutions: async () => {
    const { data, error } = await supabase
      .from('solution')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getSolutionById: async (id: string) => {
    const { data, error } = await supabase
      .from('solution')
      .select('*')
      .eq('solution_id', id)
      .single();

    if (error) return null;
    return data;
  },

  updateSolution: async (id: string, problem: string, solution: string) => {
    const { data, error } = await supabase
      .from('solution')
      .update({ problem, solution })
      .eq('solution_id', id)
      .select();

    if (error) throw error;
    return data;
  },

  deleteSolution: async (id: string) => {
    const { error } = await supabase
      .from('solution')
      .delete()
      .eq('solution_id', id);

    if (error) throw error;
    return true;
  },
};
