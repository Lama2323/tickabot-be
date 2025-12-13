import { Request, Response } from 'express';
import { ticketService } from '../services';
import { supabase } from '../utils/supabase';

export const ticketController = {
  getAllTickets: async (req: Request, res: Response) => {
    try {
      const data = await ticketService.getAllTickets();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getTicketById: async (req: Request, res: Response) => {
    try {
      const { ticket_id } = req.params;
      const userId = req.user.id;

      if (!ticket_id) {
        return res.status(400).json({ message: 'Ticket ID is required' });
      }

      const data = await ticketService.getTicketById(ticket_id);
      if (!data) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Permission Check
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('user_type')
        .eq('user_id', userId)
        .single();

      if (userError || !userData) {
        return res.status(403).json({ message: 'User profile not found' });
      }

      const userType = userData.user_type;

      if (userType === 'admin') {
        // Admin can access all
        return res.status(200).json(data);
      }

      if (userType === 'user') {
        // User can only access their own tickets
        if (data.user_id !== userId) {
          return res.status(403).json({ message: 'Access denied: You do not own this ticket' });
        }
        return res.status(200).json(data);
      }

      if (userType === 'supporter') {
        // Supporter can access tickets of their team
        const { data: supporterData } = await supabase
          .from('supporter')
          .select('team_id')
          .eq('user_id', userId)
          .single();

        if (!supporterData) {
          return res.status(403).json({ message: 'Supporter profile not found' });
        }

        // Allow if ticket is assigned to their team
        // Also allow if ticket is unassigned? (Policy check: Usually supporters pick up unassigned tickets, but user spec says "of team")
        // Sticking to "of team" as per prompt "của team chưa được xử lý"
        if (data.team_id !== supporterData.team_id) {
          return res.status(403).json({ message: 'Access denied: Ticket not assigned to your team' });
        }
        return res.status(200).json(data);
      }

      return res.status(403).json({ message: 'Unauthorized role' });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createTicket: async (req: Request, res: Response) => {
    try {
      const {
        ticket_priority = null,
        ticket_content = null,
        ticket_tone = null,
        ticket_difficulty = null,
        team_id,
        // user_id - Don't trust body user_id
      } = req.body;

      const user_id = req.user.id;

      const data = await ticketService.createTicket(
        ticket_priority,
        ticket_content,
        ticket_tone,
        ticket_difficulty,
        team_id,
        user_id
      );
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateTicket: async (req: Request, res: Response) => {
    try {
      const { ticket_id } = req.params;
      const {
        ticket_priority = null,
        ticket_content = null,
        ticket_tone = null,
        ticket_difficulty = null,
        team_id,
        user_id,
        status // Extract status
      } = req.body;

      if (!ticket_id) {
        return res.status(400).json({ message: 'Ticket ID is required' });
      }
      // Removed validation for required fields

      const data = await ticketService.updateTicket(
        ticket_id,
        ticket_priority,
        ticket_content,
        ticket_tone,
        ticket_difficulty,
        team_id,
        user_id,
        status // Pass status
      );
      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  replyTicket: async (req: Request, res: Response) => {
    try {
      const { ticket_id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      if (!ticket_id) {
        return res.status(400).json({ message: 'Ticket ID is required' });
      }
      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }

      // Determine sender_type based on user role
      const { data: userData } = await supabase.from('user').select('user_type').eq('user_id', userId).single();
      if (!userData) return res.status(403).json({ message: 'User not found' });

      let sender_type: 'user' | 'supporter';

      // Auto-detect
      if (userData.user_type === 'admin') {
        // Admins act as supporters? or have their own type?
        // Assuming admin acts as supporter strictly for this context, or we can use 'supporter'
        sender_type = 'supporter';
      } else if (userData.user_type === 'supporter') {
        sender_type = 'supporter';
      } else {
        sender_type = 'user';
      }

      // Optional: Check if user owns the ticket or supporter is assigned (Reuse getTicket logic or similar)
      const ticket = await ticketService.getTicketById(ticket_id);
      if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

      if (sender_type === 'user' && ticket.user_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (sender_type === 'supporter') {
        const { data: supporterData } = await supabase.from('supporter').select('team_id').eq('user_id', userId).single();
        if (!supporterData || supporterData.team_id !== ticket.team_id) {
          // Uncomment if strict check is needed:
          // return res.status(403).json({message: 'Access denied: Not your team'});
        }
      }

      const data = await ticketService.replyTicket(ticket_id, sender_type, content);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteTicket: async (req: Request, res: Response) => {
    try {
      const { ticket_id } = req.params;
      if (!ticket_id) {
        return res.status(400).json({ message: 'Ticket ID is required' });
      }
      await ticketService.deleteTicket(ticket_id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
