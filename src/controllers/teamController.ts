import { Request, Response } from 'express';
import { teamService } from '../services';

export const teamController = {
  getAllTeams: async (req: Request, res: Response) => {
    try {
      const data = await teamService.getAllTeams();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getTeamById: async (req: Request, res: Response) => {
    try {
      const { team_id } = req.params;
      if (!team_id) {
        return res.status(400).json({ message: 'Team ID is required' });
      }
      const data = await teamService.getTeamById(team_id);
      if (!data) {
        return res.status(404).json({ message: 'Team not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createTeam: async (req: Request, res: Response) => {
    try {
      const { team_name, team_description } = req.body;
      if (team_name === undefined) {
        return res.status(400).json({ message: 'Team name is required' });
      }
      const data = await teamService.createTeam(team_name, team_description);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateTeam: async (req: Request, res: Response) => {
    try {
      const { team_id } = req.params;
      const { team_name, team_description } = req.body;
      if (!team_id) {
        return res.status(400).json({ message: 'Team ID is required' });
      }
      if (team_name === undefined) {
        return res.status(400).json({ message: 'Team name is required' });
      }
      const data = await teamService.updateTeam(team_id, team_name, team_description);
      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Team not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteTeam: async (req: Request, res: Response) => {
    try {
      const { team_id } = req.params;
      if (!team_id) {
        return res.status(400).json({ message: 'Team ID is required' });
      }
      await teamService.deleteTeam(team_id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};