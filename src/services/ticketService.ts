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
    // Get ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from('ticket')
      .select('*')
      .eq('ticket_id', ticket_id)
      .single();

    if (ticketError) throw ticketError;

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticket_id)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    return { ...ticket, messages: messages || [] };
  },

  createTicket: async (
    ticket_priority: string | null,
    ticket_content: string | null,
    ticket_tone: string | null,
    ticket_difficulty: string | null,

    team_id?: string,
    user_id?: string
  ) => {
    // 1. Create Ticket
    let { data, error } = await supabase
      .from('ticket')
      .insert([{
        ticket_priority,
        ticket_content,
        ticket_tone,
        ticket_difficulty,

        team_id,
        user_id,
        status: 'open'
      }])
      .select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Ticket creation failed');

    const ticketId = data[0].ticket_id;

    // 2. Insert User Message
    if (ticket_content) {
      await supabase.from('ticket_messages').insert([{
        ticket_id: ticketId,
        sender_type: 'user',
        content: ticket_content
      }]);
    }

    // 3. Process with Gemini
    if (ticket_content && data && data.length > 0) {
      try {
        const routeResult = await sendToRouteGemini(ticket_content);
        const routeData = JSON.parse(routeResult);

        if (routeData.ticket_difficulty === 'easy') {
          // Case 1: Easy - AI Auto Reply
          const context = {
            ticket_priority: routeData.ticket_priority,
            ticket_tone: routeData.ticket_tone,
            ticket_difficulty: routeData.ticket_difficulty,
            team_id: routeData.team_id
          };

          const geminiResponse = await sendToResponseGemini(ticket_content, context);

          // Update Ticket
          const { data: updatedData } = await supabase
            .from('ticket')
            .update({
              ticket_priority: routeData.ticket_priority,
              ticket_tone: routeData.ticket_tone,
              ticket_difficulty: routeData.ticket_difficulty,
              team_id: routeData.team_id,
              status: 'resolved'
            })
            .eq('ticket_id', ticketId)
            .select();

          if (updatedData) data = updatedData;

          // Insert Bot Message
          await supabase.from('ticket_messages').insert([{
            ticket_id: ticketId,
            sender_type: 'bot',
            content: geminiResponse
          }]);

        } else {
          // Case 2: Not Easy - Update metadata only
          const { data: updatedData } = await supabase
            .from('ticket')
            .update({
              ticket_priority: routeData.ticket_priority,
              ticket_tone: routeData.ticket_tone,
              ticket_difficulty: routeData.ticket_difficulty,
              team_id: routeData.team_id
              // status remains 'open'
            })
            .eq('ticket_id', ticketId)
            .select();

          if (updatedData) data = updatedData;
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

    team_id?: string,
    user_id?: string,
    status?: string // Add status parameter
  ) => {
    const { data, error } = await supabase
      .from('ticket')
      .update({
        ticket_priority,
        ticket_content,
        ticket_tone,
        ticket_difficulty,

        team_id,
        user_id,
        status // Update status if provided
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

  replyTicket: async (ticket_id: string, sender_type: 'user' | 'supporter', content: string) => {
    // 1. Insert message
    const { data: message, error: messageError } = await supabase
      .from('ticket_messages')
      .insert([{
        ticket_id,
        sender_type,
        content
      }])
      .select()
      .single();

    if (messageError) throw messageError;

    // 2. Update ticket status
    // If supporter replies -> pending_user
    // If user replies -> pending_supporter
    const newStatus = sender_type === 'supporter' ? 'pending_user' : 'pending_supporter';

    const { error: updateError } = await supabase
      .from('ticket')
      .update({ status: newStatus })
      .eq('ticket_id', ticket_id);

    if (updateError) throw updateError;

    return message;
  },

  getTicketsByStatus: async (
    status: 'pending' | 'responded',
    supporter_id: string,
    sortPriority?: 'asc' | 'desc',
    sortDate?: 'asc' | 'desc',
    priorityType?: string
  ) => {
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

    // Map 'pending'/'responded' alias from FE to actual DB statuses
    if (status === 'pending') {
      // Pending for supporter means: 'open' or 'pending_supporter'
      query = query.in('status', ['open', 'pending_supporter']);
    } else {
      // Responded/Resolved means: 'resolved' or 'pending_user' (waiting for user)
      // Or maybe strictly 'resolved'? User's request implied separating:
      // "Support handles hard tickets", "User chats back and forth".
      // A ticket awaiting user reply is technically 'handled' for now by supporter.
      query = query.in('status', ['resolved', 'pending_user']);
    }

    if (priorityType) {
      query = query.eq('ticket_priority', priorityType);
    }

    if (sortDate) {
      query = query.order('created_at', { ascending: sortDate === 'asc' });
    }

    let { data, error } = await query;
    if (error) throw error;

    if (sortPriority && data) {
      const getPriorityWeight = (priority: string | null) => {
        switch (priority?.toLowerCase()) {
          case 'high': return 3;
          case 'medium': return 2;
          case 'low': return 1;
          default: return 0;
        }
      };

      data.sort((a, b) => {
        const weightA = getPriorityWeight(a.ticket_priority);
        const weightB = getPriorityWeight(b.ticket_priority);
        return sortPriority === 'asc' ? weightA - weightB : weightB - weightA;
      });
    }

    return data;
  },

  getUserTicketsByStatus: async (
    status: 'pending' | 'responded',
    user_id: string,
    sortPriority?: 'asc' | 'desc',
    sortDate?: 'asc' | 'desc',
    priorityType?: string
  ) => {
    let query = supabase
      .from('ticket')
      .select('*')
      .eq('user_id', user_id);

    if (status === 'pending') {
      // Pending for User means: 'open' (waiting for support pick up) or 'pending_supporter' (waiting for support reply)
      query = query.in('status', ['open', 'pending_supporter']);
    } else {
      // Responded for User means: 'resolved' or 'pending_user' (support replied, waiting for user)
      query = query.in('status', ['resolved', 'pending_user']);
    }

    if (priorityType) {
      query = query.eq('ticket_priority', priorityType);
    }

    if (sortDate) {
      query = query.order('created_at', { ascending: sortDate === 'asc' });
    }

    let { data, error } = await query;
    if (error) throw error;

    if (sortPriority && data) {
      const getPriorityWeight = (priority: string | null) => {
        switch (priority?.toLowerCase()) {
          case 'high': return 3;
          case 'medium': return 2;
          case 'low': return 1;
          default: return 0;
        }
      };

      data.sort((a, b) => {
        const weightA = getPriorityWeight(a.ticket_priority);
        const weightB = getPriorityWeight(b.ticket_priority);
        return sortPriority === 'asc' ? weightA - weightB : weightB - weightA;
      });
    }

    return data;
  },
};