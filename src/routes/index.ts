import { Router } from 'express';
import ticketRouter from './ticketRoutes';
import profileRouter from './profileRoutes';
import teamRouter from './teamRoutes';
import supporterRouter from './supporterRoutes';
import responseRouter from './responseRoutes';

const router = Router();

router.use('/tickets', ticketRouter);
router.use('/profiles', profileRouter);
router.use('/teams', teamRouter);
router.use('/supporters', supporterRouter);
router.use('/responses', responseRouter);

export default router;