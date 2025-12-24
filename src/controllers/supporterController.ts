import { Request, Response } from 'express';
import { supporterService } from '../services/supporterService';
import { ticketService } from '../services/ticketService';
import { supabase } from '../utils/supabase';

export const supporterController = {
  getAllSupporters: async (req: Request, res: Response) => {
    try {
      const data = await supporterService.getAllSupporters();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getSupporterById: async (req: Request, res: Response) => {
    try {
      const { supporter_id } = req.params;
      if (!supporter_id) {
        return res.status(400).json({ success: false, message: 'Supporter ID is required' });
      }
      const data = await supporterService.getSupporterById(supporter_id);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Supporter not found' });
      }
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  createSupporter: async (req: Request, res: Response) => {
    try {
      const { supporter_id, team_id, supporter_name, user_id } = req.body;
      if (supporter_name === undefined || !supporter_id) {
        return res.status(400).json({ success: false, message: 'Supporter ID and name are required' });
      }
      const data = await supporterService.createSupporter(supporter_id, team_id || null, supporter_name, user_id);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  updateSupporter: async (req: Request, res: Response) => {
    try {
      const { supporter_id } = req.params;
      const { team_id, supporter_name, user_id } = req.body;
      if (!supporter_id) {
        return res.status(400).json({ success: false, message: 'Supporter ID is required' });
      }
      if (team_id === undefined || supporter_name === undefined) {
        return res.status(400).json({ success: false, message: 'Team ID and supporter name are required' });
      }
      const data = await supporterService.updateSupporter(supporter_id, team_id, supporter_name, user_id);
      if (!data || data.length === 0) {
        return res.status(404).json({ success: false, message: 'Supporter not found' });
      }
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  deleteSupporter: async (req: Request, res: Response) => {
    try {
      const { supporter_id } = req.params;
      if (!supporter_id) {
        return res.status(400).json({ success: false, message: 'Supporter ID is required' });
      }
      await supporterService.deleteSupporter(supporter_id);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getSupporterTicketByStatus: async (req: Request, res: Response) => {
    try {
      const { status, sortPriority, sortDate, priorityType } = req.query;
      const { supporter_id: paramSupporterId } = req.params;
      const userId = req.user.id; // From authMiddleware

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      // Fetch supporter_id
      let finalSupporterId = paramSupporterId;
      if (!finalSupporterId) {
        const { data: supporter, error: supporterError } = await supabase
          .from('supporter')
          .select('supporter_id')
          .eq('user_id', userId)
          .single();

        if (supporterError || !supporter) {
          return res.status(403).json({ success: false, message: 'Supporter profile not found for this user' });
        }
        finalSupporterId = supporter.supporter_id;
      }

      if (!finalSupporterId) {
        return res.status(400).json({ success: false, message: 'Supporter ID is required' });
      }

      const tickets = await ticketService.getTicketsByStatus(
        status as string,
        finalSupporterId,
        sortPriority as 'asc' | 'desc' | undefined,
        sortDate as 'asc' | 'desc' | undefined,
        priorityType as string | undefined
      );

      res.status(200).json({ success: true, data: tickets });
    } catch (error: any) {
      if (error.message === 'Supporter not found') {
        return res.status(404).json({ success: false, message: 'Supporter not found' });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
