import { supabase } from '../utils/supabase';
import { sendToRouteGemini } from '../utils/routeGemini';
import { sendToResponseGemini } from '../utils/responseGemini';
import { sendToSummaryGemini } from '../utils/summaryGemini';
import { sendToMatchGemini } from '../utils/matchGemini';
import { solutionService } from './solutionService';


// Standalone function to avoid circular dependency when calling from within ticketService methods
const getTicketByIdFunc = async (ticket_id: string) => {
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
};


export const ticketService = {
  getAllTickets: async () => {
    const { data, error } = await supabase
      .from('ticket')
      .select('*');
    if (error) throw error;
    return data;
  },

  getTicketById: getTicketByIdFunc,

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

    // 3. Process with Gemini - RUN IN BACKGROUND
    if (ticket_content && data && data.length > 0) {
      (async () => {
        try {
          const routeResult = await sendToRouteGemini(ticket_content);
          console.log("Gemini Route Result:", routeResult);
          const routeData = JSON.parse(routeResult);

          // Check for matching solution in Knowledge Base first
          let matchFound = false;
          if (routeData.team_id) {
            const solutions = await solutionService.getSolutionsByTeam(routeData.team_id);
            const matchResultRaw = await sendToMatchGemini(ticket_content, solutions);
            const matchResult = JSON.parse(matchResultRaw);

            if (matchResult.foundMatch && matchResult.solution && matchResult.confidence > 0.8) {
              matchFound = true;
              console.log("Solution found in Knowledge Base.");

              // Update Ticket to Resolved
              await supabase
                .from('ticket')
                .update({
                  ticket_priority: routeData.ticket_priority,
                  ticket_tone: routeData.ticket_tone,
                  ticket_difficulty: 'easy', // Treated as easy if auto-solved
                  team_id: routeData.team_id,
                  status: 'resolved'
                })
                .eq('ticket_id', ticketId);

              // Insert Bot Message (Solution)
              await supabase.from('ticket_messages').insert([{
                ticket_id: ticketId,
                sender_type: 'bot',
                content: matchResult.solution
              }]);
            }
          }

          if (matchFound) {
            // Case 0: Match Found (Already handled above)
          } else if (routeData.ticket_difficulty === 'easy') {
            console.log("Ticket classified as EASY. Auto-replying...");
            // Case 1: Easy - AI Auto Reply
            const context = {
              ticket_priority: routeData.ticket_priority,
              ticket_tone: routeData.ticket_tone,
              ticket_difficulty: routeData.ticket_difficulty,
              team_id: routeData.team_id
            };

            const geminiResponse = await sendToResponseGemini(ticket_content, context);

            // Update Ticket
            await supabase
              .from('ticket')
              .update({
                ticket_priority: routeData.ticket_priority,
                ticket_tone: routeData.ticket_tone,
                ticket_difficulty: routeData.ticket_difficulty,
                team_id: routeData.team_id,
                status: 'resolved'
              })
              .eq('ticket_id', ticketId);

            // Insert Bot Message
            await supabase.from('ticket_messages').insert([{
              ticket_id: ticketId,
              sender_type: 'bot',
              content: geminiResponse
            }]);

          } else {
            console.log("Ticket classified as MEDIUM/HARD. Updating metadata...");
            // Case 2: Not Easy AND No Match - Update metadata only
            const { error: updateError } = await supabase
              .from('ticket')
              .update({
                ticket_priority: routeData.ticket_priority,
                ticket_tone: routeData.ticket_tone,
                ticket_difficulty: routeData.ticket_difficulty,
                team_id: routeData.team_id
              })
              .eq('ticket_id', ticketId);

            if (updateError) {
              console.error("Error updating ticket metadata:", updateError);
            } else {
              console.log("Ticket metadata updated successfully.");
            }

            // Added: Send detailed acknowledgement message
            let teamName = 'Support';
            if (routeData.team_id) {
              const { data: teamData } = await supabase
                .from('team')
                .select('team_name')
                .eq('team_id', routeData.team_id)
                .single();
              if (teamData) teamName = teamData.team_name;
            }

            await supabase.from('ticket_messages').insert([{
              ticket_id: ticketId,
              sender_type: 'bot',
              content: `Chào bạn, vấn đề của bạn đã được phân loại và chuyển đến team ${teamName}. Vui lòng chờ Supporter phản hồi.`
            }]);
          }
        } catch (err) {
          console.error("Error processing ticket with Gemini in background:", err);
        }
      })();
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
    const updateData: any = {};
    if (ticket_priority !== undefined) updateData.ticket_priority = ticket_priority;
    if (ticket_content !== undefined) updateData.ticket_content = ticket_content;
    if (ticket_tone !== undefined) updateData.ticket_tone = ticket_tone;
    if (ticket_difficulty !== undefined) updateData.ticket_difficulty = ticket_difficulty;
    if (team_id !== undefined) updateData.team_id = team_id;
    if (user_id !== undefined) updateData.user_id = user_id;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from('ticket')
      .update(updateData)
      .eq('ticket_id', ticket_id)
      .select();
    if (error) throw error;

    // Trigger Summarization if Status -> Resolved - RUN IN BACKGROUND
    if (status === 'resolved') {
      // Run as an immediately-invoked async function without await
      (async () => {
        try {
          // Fetch full ticket details including messages
          const fullTicket = await getTicketByIdFunc(ticket_id);

          if (fullTicket.team_id && fullTicket.messages.length > 0) {
            const summaryRaw = await sendToSummaryGemini(fullTicket.messages);
            const summary = JSON.parse(summaryRaw);

            if (summary.shouldRemember) {
              await solutionService.createSolution(
                fullTicket.team_id,
                ticket_id,
                summary.problem,
                summary.solution
              );
            }
          }
        } catch (sumError) {
          console.error("Error summarizing ticket in background:", sumError);
        }
      })();
    }

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
    status: string, // Changed from union type to generic string for comma-separated values
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

    // Support comma-separated statuses e.g. "open,pending_supporter"
    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      query = query.in('status', statuses);
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
    status: string, // Changed from union type to generic string for comma-separated values
    user_id: string,
    sortPriority?: 'asc' | 'desc',
    sortDate?: 'asc' | 'desc',
    priorityType?: string
  ) => {
    let query = supabase
      .from('ticket')
      .select('*')
      .eq('user_id', user_id);

    // Support comma-separated statuses e.g. "pending_supporter,resolved"
    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      query = query.in('status', statuses);
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