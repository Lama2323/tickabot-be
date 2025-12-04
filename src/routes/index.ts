import { Router } from 'express';
import ticketRouter from './ticketRoutes';
import userRouter from './userRoutes';
import teamRouter from './teamRoutes';
import supporterRouter from './supporterRoutes';

const router = Router();

router.use('/tickets', ticketRouter);
router.use('/users', userRouter);
router.use('/teams', teamRouter);
router.use('/supporters', supporterRouter);

export default router;