import { Request, Response } from 'express';
import { userService } from '../services';

export const userController = {
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const data = await userService.getAllUsers();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getUserById: async (req: Request, res: Response) => {
    try {
      const { user_id } = req.params;
      if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      const data = await userService.getUserById(user_id);
      if (!data) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createUser: async (req: Request, res: Response) => {
    try {
      const { user_id, user_type, user_name } = req.body;
      if (user_type === undefined || user_name === undefined || !user_id) {
        return res.status(400).json({ message: 'User ID, type and name are required' });
      }
      const data = await userService.createUser(user_id, user_type, user_name);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      const { user_id } = req.params;
      const { user_type, user_name } = req.body;
      if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      if (user_type === undefined || user_name === undefined) {
        return res.status(400).json({ message: 'User type and user name are required' });
      }
      const data = await userService.updateUser(user_id, user_type, user_name);
      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    try {
      const { user_id } = req.params;
      if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      await userService.deleteUser(user_id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};