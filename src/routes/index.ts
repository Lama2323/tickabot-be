import { Router } from 'express';
import ticketRouter from './ticketRoutes';
import profileRouter from './profileRoutes';
import teamRouter from './teamRoutes';
import agentRouter from './agentRoutes';
import responseRouter from './responseRoutes';

const router = Router();

router.use('/tickets', ticketRouter);
router.use('/profiles', profileRouter);
router.use('/teams', teamRouter);
router.use('/agents', agentRouter);
router.use('/responses', responseRouter);

export default router;