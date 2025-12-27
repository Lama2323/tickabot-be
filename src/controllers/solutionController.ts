import { Request, Response } from 'express';
import { solutionService } from '../services/solutionService';

export const solutionController = {
  getAllSolutions: async (req: Request, res: Response) => {
    try {
      const data = await solutionService.getAllSolutions();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getSolutionById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ success: false, message: 'ID is required' });
      const data = await solutionService.getSolutionById(id);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Solution not found' });
      }
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  createSolution: async (req: Request, res: Response) => {
    try {
      const { team_id, ticket_id, problem, solution } = req.body;
      if (!team_id || !problem || !solution) {
        return res.status(400).json({ success: false, message: 'Team ID, Problem and Solution are required' });
      }
      const data = await solutionService.createSolution(team_id, ticket_id || null, problem, solution);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  updateSolution: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { problem, solution } = req.body;
      if (!id) return res.status(400).json({ success: false, message: 'Solution ID is required' });
      if (problem === undefined || solution === undefined) {
        return res.status(400).json({ success: false, message: 'Problem and Solution are required' });
      }

      const data = await solutionService.updateSolution(id, problem, solution);
      if (!data || data.length === 0) {
        return res.status(404).json({ success: false, message: 'Solution not found' });
      }
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  deleteSolution: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ success: false, message: 'ID is required' });
      await solutionService.deleteSolution(id);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
