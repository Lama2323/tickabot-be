import { Request, Response } from 'express';
import { ticketService } from '../services';

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
      if (!ticket_id) {
        return res.status(400).json({ message: 'Ticket ID is required' });
      }
      const data = await ticketService.getTicketById(ticket_id);
      if (!data) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createTicket: async (req: Request, res: Response) => {
    try {
      const { 
        ticket_priority, 
        ticket_content, 
        ticket_type, 
        ticket_difficulty, 
        response_content = null, 
        team_id 
      } = req.body;
      
      if (!ticket_priority || !ticket_content || !ticket_type || !ticket_difficulty) {
        return res.status(400).json({ 
          message: 'Ticket priority, content, type, and difficulty are required' 
        });
      }
      
      const data = await ticketService.createTicket(
        ticket_priority, 
        ticket_content, 
        ticket_type, 
        ticket_difficulty,
        response_content,
        team_id
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
        ticket_priority, 
        ticket_content, 
        ticket_type, 
        ticket_difficulty, 
        response_content = null, 
        team_id 
      } = req.body;
      
      if (!ticket_id) {
        return res.status(400).json({ message: 'Ticket ID is required' });
      }
      if (!ticket_priority || !ticket_content || !ticket_type || !ticket_difficulty) {
        return res.status(400).json({ 
          message: 'Ticket priority, content, type, and difficulty are required' 
        });
      }
      
      const data = await ticketService.updateTicket(
        ticket_id, 
        ticket_priority, 
        ticket_content, 
        ticket_type, 
        ticket_difficulty,
        response_content,
        team_id
      );
      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      res.status(200).json(data);
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

  getTicketsByStatus: async (req: Request, res: Response) => {
    try {
      const { status, supporter_id } = req.query;
      
      if (!status || !supporter_id) {
        return res.status(400).json({ 
          message: 'Status and supporter_id are required' 
        });
      }

      if (status !== 'pending' && status !== 'responded') {
        return res.status(400).json({ 
          message: 'Status must be either "pending" or "responded"' 
        });
      }

      const tickets = await ticketService.getTicketsByStatus(
        status as 'pending' | 'responded', 
        supporter_id as string
      );
      
      res.status(200).json(tickets);
    } catch (error: any) {
      if (error.message === 'Supporter not found') {
        return res.status(404).json({ message: 'Supporter not found' });
      }
      res.status(500).json({ error: error.message });
    }
  },
};