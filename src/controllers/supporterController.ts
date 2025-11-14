import { Request, Response } from 'express';
import { supporterService } from '../services/supporterService';

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
      const { team_id, supporter_name } = req.body;
      if (team_id === undefined || supporter_name === undefined) {
        return res.status(400).json({ message: 'Team ID and supporter name are required' });
      }
      const data = await supporterService.createSupporter(team_id, supporter_name);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateSupporter: async (req: Request, res: Response) => {
    try {
      const { supporter_id } = req.params;
      const { team_id, supporter_name } = req.body;
      if (!supporter_id) {
        return res.status(400).json({ message: 'Supporter ID is required' });
      }
      if (team_id === undefined || supporter_name === undefined) {
        return res.status(400).json({ message: 'Team ID and supporter name are required' });
      }
      const data = await supporterService.updateSupporter(supporter_id, team_id, supporter_name);
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
};