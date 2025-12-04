import { Router } from 'express';
import { supporterController } from '../controllers/supporterController';

const supporterRouter = Router();

supporterRouter.get('/', supporterController.getAllSupporters);
supporterRouter.get('/tickets', supporterController.getSupporterTicketByStatus);
supporterRouter.get('/:supporter_id', supporterController.getSupporterById);
supporterRouter.post('/', supporterController.createSupporter);
supporterRouter.put('/:supporter_id', supporterController.updateSupporter);
supporterRouter.delete('/:supporter_id', supporterController.deleteSupporter);

export default supporterRouter;