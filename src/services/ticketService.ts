import { supabase } from '../utils/supabase';
import { sendToRouteGemini } from '../utils/routeGemini';
import { sendToResponseGemini } from '../utils/responseGemini';


export const ticketService = {
  getAllTickets: async () => {
    const { data, error } = await supabase
      .from('ticket')
      .select('*');
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
    ticket_priority: string | null,
    ticket_content: string | null,
    ticket_tone: string | null,
    ticket_difficulty: string | null,
    response_content: string | null = null,
    team_id?: string,
    user_id?: string
  ) => {
    let { data, error } = await supabase
      .from('ticket')
      .insert([{
        ticket_priority,
        ticket_content,
        ticket_tone,
        ticket_difficulty,
        response_content,
        team_id,
        user_id
      }])
      .select();
    if (error) throw error;

    // Gửi nội dung ticket đến Gemini và ghi phản hồi
    if (ticket_content && data && data.length > 0) {
      try {
        const routeResult = await sendToRouteGemini(ticket_content);
        const routeData = JSON.parse(routeResult);

        if (routeData.ticket_difficulty === 'easy') {
          const context = {
            ticket_priority: routeData.ticket_priority,
            ticket_tone: routeData.ticket_tone,
            ticket_difficulty: routeData.ticket_difficulty,
            team_id: routeData.team_id
          };

          const geminiResponse = await sendToResponseGemini(ticket_content, context);

          const { data: updatedData } = await supabase
            .from('ticket')
            .update({
              ticket_priority: routeData.ticket_priority,
              ticket_tone: routeData.ticket_tone,
              ticket_difficulty: routeData.ticket_difficulty,
              team_id: routeData.team_id,
              response_content: geminiResponse
            })
            .eq('ticket_id', data[0].ticket_id)
            .select();

          if (updatedData) {
            data = updatedData;
          }

        } else {
          const { data: updatedData } = await supabase
            .from('ticket')
            .update({
              ticket_priority: routeData.ticket_priority,
              ticket_tone: routeData.ticket_tone,
              ticket_difficulty: routeData.ticket_difficulty,
              team_id: routeData.team_id
            })
            .eq('ticket_id', data[0].ticket_id)
            .select();

          if (updatedData) {
            data = updatedData;
          }
        }
      } catch (err) {
        console.error("Error processing ticket with Gemini:", err);
      }
    }

    return data;
  },

  updateTicket: async (
    ticket_id: string,
    ticket_priority: string | null,
    ticket_content: string | null,
    ticket_tone: string | null,
    ticket_difficulty: string | null,
    response_content: string | null = null,
    team_id?: string,
    user_id?: string
  ) => {
    const { data, error } = await supabase
      .from('ticket')
      .update({
        ticket_priority,
        ticket_content,
        ticket_tone,
        ticket_difficulty,
        response_content,
        team_id,
        user_id
      })
      .eq('ticket_id', ticket_id)
      .select();
    if (error) throw error;
    return data;
  },

  deleteTicket: async (ticket_id: string) => {
    const { error } = await supabase
      .from('ticket')
      .delete()
      .eq('ticket_id', ticket_id);
    if (error) throw error;
    return;
  },

  getTicketsByStatus: async (status: 'pending' | 'responded', supporter_id: string) => {
    // First get the supporter to get their team_id
    const { data: supporter, error: supporterError } = await supabase
      .from('supporter')
      .select('team_id')
      .eq('supporter_id', supporter_id)
      .single();

    if (supporterError || !supporter) {
      throw new Error('Supporter not found');
    }

    // Then get tickets based on status
    let query = supabase
      .from('ticket')
      .select('*')
      .eq('team_id', supporter.team_id);

    if (status === 'pending') {
      query = query.is('response_content', null);
    } else {
      query = query.not('response_content', 'is', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getUserTicketsByStatus: async (status: 'pending' | 'responded', user_id: string) => {
    let query = supabase
      .from('ticket')
      .select('*')
      .eq('user_id', user_id);

    if (status === 'pending') {
      query = query.is('response_content', null);
    } else {
      query = query.not('response_content', 'is', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
};