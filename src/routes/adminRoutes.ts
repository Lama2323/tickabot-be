import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { isAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Apply admin check middleware to all routes in this file
router.use(isAdmin);

// Supporters
router.get('/supporters', adminController.getAllSupporters);
router.get('/supporters/:id', adminController.getSupporterById);
router.post('/supporters', adminController.createSupporter);
router.post('/supporters/add', adminController.addSupporter);
router.put('/supporters/:id', adminController.updateSupporter);
router.delete('/supporters/:id', adminController.deleteSupporter);

// Teams
router.get('/teams', adminController.getAllTeams);
router.get('/teams/:id', adminController.getTeamById);
router.post('/teams', adminController.createTeam);
router.put('/teams/:id', adminController.updateTeam);
router.delete('/teams/:id', adminController.deleteTeam);

// Users
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Tickets (No POST)
router.get('/tickets', adminController.getAllTickets);
router.get('/tickets/:id', adminController.getTicketById);
router.put('/tickets/:id', adminController.updateTicket);
router.delete('/tickets/:id', adminController.deleteTicket);

export default router;
