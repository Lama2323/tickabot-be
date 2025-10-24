import { Router } from 'express';
import { responseController } from '../controllers';

const responseRouter = Router();

responseRouter.get('/', responseController.getAllResponses);
responseRouter.get('/:response_id', responseController.getResponseById);
responseRouter.post('/', responseController.createResponse);
responseRouter.put('/:response_id', responseController.updateResponse);
responseRouter.delete('/:response_id', responseController.deleteResponse);

export default responseRouter;