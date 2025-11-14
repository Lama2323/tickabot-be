import { supabase } from '../utils/supabase';
import { sendToResponseGemini } from '../utils/responseGemini';

export const ticketService = {
  getAllTickets: async () => {
    const { data, error } = await supabase.from('ticket').select('*');
    if (error) throw error;
    return data;
  },

  getTicketById: async (ticket_id: string) => {
    const { data, error } = await supabase
      .from('ticket')
      .select('*')
      .eq('ticket_id', ticket_id)
      .single();
    if (error) throw error;
    return data;
  },

  createTicket: async (
    ticket_priority: string, 
    ticket_content: string, 
    ticket_type: string, 
    ticket_difficulty: string,
    response_id?: string,
    team_id?: string
  ) => {
    const { data, error } = await supabase
      .from('ticket')
      .insert([{ 
        ticket_priority, 
        ticket_content, 
        ticket_type, 
        ticket_difficulty,
        response_id,
        team_id
      }])
      .select();
    if (error) throw error;

    // Gửi nội dung ticket đến Gemini và ghi phản hồi
    await sendToResponseGemini(ticket_content);

    return data;
  },

  updateTicket: async (
    ticket_id: string, 
    ticket_priority: string, 
    ticket_content: string, 
    ticket_type: string, 
    ticket_difficulty: string,
    response_id?: string,
    team_id?: string
  ) => {
    const { data, error } = await supabase
      .from('ticket')
      .update({ 
        ticket_priority, 
        ticket_content, 
        ticket_type, 
        ticket_difficulty,
        response_id,
        team_id
      })
      .eq('ticket_id', ticket_id)
      .select();
    if (error) throw error;
    return data;
  },

  deleteTicket: async (ticket_id: string) => {
    const { error } = await supabase.from('ticket').delete().eq('ticket_id', ticket_id);
    if (error) throw error;
    return;
  },
};