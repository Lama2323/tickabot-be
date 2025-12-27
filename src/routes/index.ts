import { Router } from 'express';
import ticketRouter from './ticketRoutes';
import userRouter from './userRoutes';
import teamRouter from './teamRoutes';
import supporterRouter from './supporterRoutes';
import adminRouter from './adminRoutes';
import solutionRouter from './solutionRoutes';
import { authRoutes } from './authRoutes';

const router = Router();

authRoutes(router);
router.use('/tickets', ticketRouter);
router.use('/users', userRouter);
router.use('/teams', teamRouter);
router.use('/supporters', supporterRouter);
router.use('/solutions', solutionRouter);
router.use('/admin', adminRouter);

export default router;