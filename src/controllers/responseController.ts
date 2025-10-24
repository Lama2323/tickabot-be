import { Request, Response } from 'express';
import { responseService } from '../services';

export const responseController = {
  getAllResponses: async (req: Request, res: Response) => {
    try {
      const data = await responseService.getAllResponses();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getResponseById: async (req: Request, res: Response) => {
    try {
      const { response_id } = req.params;
      if (!response_id) {
        return res.status(400).json({ message: 'Response ID is required' });
      }
      const data = await responseService.getResponseById(response_id);
      if (!data) {
        return res.status(404).json({ message: 'Response not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createResponse: async (req: Request, res: Response) => {
    try {
      const { ticket_id, response_content } = req.body;
      if (ticket_id === undefined || response_content === undefined) {
        return res.status(400).json({ message: 'Ticket ID and response_content are required' });
      }
      const data = await responseService.createResponse(ticket_id, response_content);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateResponse: async (req: Request, res: Response) => {
    try {
      const { response_id } = req.params;
      const { ticket_id, response_content } = req.body;
      if (!response_id) {
        return res.status(400).json({ message: 'Response ID is required' });
      }
      if (ticket_id === undefined || response_content === undefined) {
        return res.status(400).json({ message: 'Ticket ID and response_content are required' });
      }
      const data = await responseService.updateResponse(response_id, ticket_id, response_content);
      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Response not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteResponse: async (req: Request, res: Response) => {
    try {
      const { response_id } = req.params;
      if (!response_id) {
        return res.status(400).json({ message: 'Response ID is required' });
      }
      await responseService.deleteResponse(response_id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};