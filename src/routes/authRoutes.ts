import { Router } from 'express';
import { AuthController } from '../controllers/authController';

export const authRoutes = (router: Router) => {
  const authController = new AuthController();

  // Public routes
  router.post('/auth/signup', (req, res) => authController.signUp(req, res));
  router.post('/auth/login', (req, res) => authController.login(req, res));
  router.get('/auth/me', (req, res) => authController.getCurrentUser(req, res));
  router.post('/auth/logout', (req, res) => authController.logout(req, res));

  return router;
};
