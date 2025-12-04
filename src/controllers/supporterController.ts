import { Request, Response } from 'express';
import { supporterService } from '../services/supporterService';
import { ticketService } from '../services/ticketService';

export const supporterController = {
  getAllSupporters: async (req: Request, res: Response) => {
    try {
      const data = await supporterService.getAllSupporters();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getSupporterById: async (req: Request, res: Response) => {
    try {
      const { supporter_id } = req.params;
      if (!supporter_id) {
        return res.status(400).json({ message: 'Supporter ID is required' });
      }
      const data = await supporterService.getSupporterById(supporter_id);
      if (!data) {
        return res.status(404).json({ message: 'Supporter not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createSupporter: async (req: Request, res: Response) => {
    try {
      const { supporter_id, team_id, supporter_name, user_id } = req.body;
      if (supporter_name === undefined || !supporter_id) {
        return res.status(400).json({ message: 'Supporter ID and name are required' });
      }
      const data = await supporterService.createSupporter(supporter_id, team_id || null, supporter_name, user_id);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateSupporter: async (req: Request, res: Response) => {
    try {
      const { supporter_id } = req.params;
      const { team_id, supporter_name, user_id } = req.body;
      if (!supporter_id) {
        return res.status(400).json({ message: 'Supporter ID is required' });
      }
      if (team_id === undefined || supporter_name === undefined) {
        return res.status(400).json({ message: 'Team ID and supporter name are required' });
      }
      const data = await supporterService.updateSupporter(supporter_id, team_id, supporter_name, user_id);
      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Supporter not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteSupporter: async (req: Request, res: Response) => {
    try {
      const { supporter_id } = req.params;
      if (!supporter_id) {
        return res.status(400).json({ message: 'Supporter ID is required' });
      }
      await supporterService.deleteSupporter(supporter_id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getSupporterTicketByStatus: async (req: Request, res: Response) => {
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