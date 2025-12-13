import { Router } from 'express';
import { teamController } from '../controllers';
import { verifyToken } from '../middlewares/authMiddleware';

const teamRouter = Router();

teamRouter.use(verifyToken);

teamRouter.get('/', teamController.getAllTeams);
teamRouter.get('/:team_id', teamController.getTeamById);
teamRouter.post('/', teamController.createTeam);
teamRouter.put('/:team_id', teamController.updateTeam);
teamRouter.delete('/:team_id', teamController.deleteTeam);

export default teamRouter;