import { Request, Response } from 'express';
import { agentService } from '../services';

export const agentController = {
  getAllAgents: async (req: Request, res: Response) => {
    try {
      const data = await agentService.getAllAgents();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getAgentById: async (req: Request, res: Response) => {
    try {
      const { agent_id } = req.params;
      if (!agent_id) {
        return res.status(400).json({ message: 'Agent ID is required' });
      }
      const data = await agentService.getAgentById(agent_id);
      if (!data) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createAgent: async (req: Request, res: Response) => {
    try {
      const { team_id, agent_name } = req.body;
      if (team_id === undefined || agent_name === undefined) {
        return res.status(400).json({ message: 'Team ID and agent name are required' });
      }
      const data = await agentService.createAgent(team_id, agent_name);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateAgent: async (req: Request, res: Response) => {
    try {
      const { agent_id } = req.params;
      const { team_id, agent_name } = req.body;
      if (!agent_id) {
        return res.status(400).json({ message: 'Agent ID is required' });
      }
      if (team_id === undefined || agent_name === undefined) {
        return res.status(400).json({ message: 'Team ID and agent name are required' });
      }
      const data = await agentService.updateAgent(agent_id, team_id, agent_name);
      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteAgent: async (req: Request, res: Response) => {
    try {
      const { agent_id } = req.params;
      if (!agent_id) {
        return res.status(400).json({ message: 'Agent ID is required' });
      }
      await agentService.deleteAgent(agent_id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};