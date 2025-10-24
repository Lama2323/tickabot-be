import { Router } from 'express';
import { agentController } from '../controllers';

const agentRouter = Router();

agentRouter.get('/', agentController.getAllAgents);
agentRouter.get('/:agent_id', agentController.getAgentById);
agentRouter.post('/', agentController.createAgent);
agentRouter.put('/:agent_id', agentController.updateAgent);
agentRouter.delete('/:agent_id', agentController.deleteAgent);

export default agentRouter;