import { Request, Response } from 'express';
import { profileService } from '../services';

export const profileController = {
  getAllProfiles: async (req: Request, res: Response) => {
    try {
      const data = await profileService.getAllProfiles();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getProfileById: async (req: Request, res: Response) => {
    try {
      const { profile_id } = req.params;
      if (!profile_id) {
        return res.status(400).json({ message: 'Profile ID is required' });
      }
      const data = await profileService.getProfileById(profile_id);
      if (!data) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createProfile: async (req: Request, res: Response) => {
    try {
      const { profile_type, profile_name } = req.body;
      if (profile_type === undefined || profile_name === undefined) {
        return res.status(400).json({ message: 'Profile type and profile name are required' });
      }
      const data = await profileService.createProfile(profile_type, profile_name);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateProfile: async (req: Request, res: Response) => {
    try {
      const { profile_id } = req.params;
      const { profile_type, profile_name } = req.body;
      if (!profile_id) {
        return res.status(400).json({ message: 'Profile ID is required' });
      }
      if (profile_type === undefined || profile_name === undefined) {
        return res.status(400).json({ message: 'Profile type and profile name are required' });
      }
      const data = await profileService.updateProfile(profile_id, profile_type, profile_name);
      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteProfile: async (req: Request, res: Response) => {
    try {
      const { profile_id } = req.params;
      if (!profile_id) {
        return res.status(400).json({ message: 'Profile ID is required' });
      }
      await profileService.deleteProfile(profile_id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};