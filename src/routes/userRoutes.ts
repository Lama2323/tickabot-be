import { Router } from 'express';
import { userController } from '../controllers';

const userRouter = Router();

userRouter.get('/', userController.getAllUsers);
userRouter.get('/tickets', userController.getUserTicketByStatus);
userRouter.get('/:user_id', userController.getUserById);
userRouter.post('/', userController.createUser);
userRouter.put('/:user_id', userController.updateUser);
userRouter.delete('/:user_id', userController.deleteUser);

export default userRouter;