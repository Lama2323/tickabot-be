import { Router } from 'express';
import { teamController } from '../controllers';

const teamRouter = Router();

teamRouter.get('/', teamController.getAllTeams);
teamRouter.get('/:team_id', teamController.getTeamById);
teamRouter.post('/', teamController.createTeam);
teamRouter.put('/:team_id', teamController.updateTeam);
teamRouter.delete('/:team_id', teamController.deleteTeam);

export default teamRouter;