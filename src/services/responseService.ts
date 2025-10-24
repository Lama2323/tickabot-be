import { supabase } from '../utils/supabase';

export const responseService = {
  getAllResponses: async () => {
    const { data, error } = await supabase.from('response').select('*');
    if (error) throw error;
    return data;
  },

  getResponseById: async (response_id: string) => {
    const { data, error } = await supabase
      .from('response')
      .select('*')
      .eq('response_id', response_id)
      .single();
    if (error) throw error;
    return data;
  },

  createResponse: async (ticket_id: string, response_content: string) => {
    const { data, error } = await supabase
      .from('response')
      .insert([{ ticket_id, content: response_content }])
      .select();
    if (error) throw error;
    return data;
  },

  updateResponse: async (response_id: string, ticket_id: string, response_content: string) => {
    const { data, error } = await supabase
      .from('response')
      .update({ ticket_id, content: response_content })
      .eq('response_id', response_id)
      .select();
    if (error) throw error;
    return data;
  },

  deleteResponse: async (response_id: string) => {
    const { error } = await supabase.from('response').delete().eq('response_id', response_id);
    if (error) throw error;
    return;
  },
};