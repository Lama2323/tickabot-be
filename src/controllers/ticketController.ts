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
        ticket_priority = null,
        ticket_content = null,
        ticket_tone = null,
        ticket_difficulty = null,
        response_content = null,
        team_id,
        user_id
      } = req.body;

      const data = await ticketService.createTicket(
        ticket_priority,
        ticket_content,
        ticket_tone,
        ticket_difficulty,
        response_content,
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
        response_content = null,
        team_id,
        user_id
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
        response_content,
        team_id,
        user_id
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
};