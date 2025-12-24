import type { Request, Response } from 'express';
import { UserRole } from '../models/User';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export class AuthController {
  async signUp(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, and name are required'
        });
      }

      const result = await authService.signUp(
        { email, password },
        { name }
      );

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const user = await authService.getUser();

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  }

  async logout(_req: Request, res: Response) {
    try {
      await authService.signOut();

      res.status(200).json({
        success: true,
        message: 'Successfully logged out'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  }
}
