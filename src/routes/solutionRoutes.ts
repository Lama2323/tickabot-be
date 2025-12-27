import { Router } from 'express';
import { solutionController } from '../controllers/solutionController';
import { verifyToken } from '../middlewares/authMiddleware';

const solutionRouter = Router();

solutionRouter.use(verifyToken);

solutionRouter.get('/', solutionController.getAllSolutions);
solutionRouter.get('/:id', solutionController.getSolutionById);
solutionRouter.post('/', solutionController.createSolution);
solutionRouter.put('/:id', solutionController.updateSolution);
solutionRouter.delete('/:id', solutionController.deleteSolution);

export default solutionRouter;
