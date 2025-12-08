import { Router } from 'express';
import ticketRouter from './ticketRoutes';
import userRouter from './userRoutes';
import teamRouter from './teamRoutes';
import supporterRouter from './supporterRoutes';
import adminRouter from './adminRoutes';

const router = Router();

router.use('/tickets', ticketRouter);
router.use('/users', userRouter);
router.use('/teams', teamRouter);
router.use('/supporters', supporterRouter);
router.use('/admin', adminRouter);

export default router;