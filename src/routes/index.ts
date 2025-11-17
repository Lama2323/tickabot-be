import { Router } from 'express';
import ticketRouter from './ticketRoutes';
import profileRouter from './profileRoutes';
import teamRouter from './teamRoutes';
import supporterRouter from './supporterRoutes';

const router = Router();

router.use('/tickets', ticketRouter);
router.use('/profiles', profileRouter);
router.use('/teams', teamRouter);
router.use('/supporters', supporterRouter);

export default router;