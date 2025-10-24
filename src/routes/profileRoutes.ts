import { Router } from 'express';
import { profileController } from '../controllers';

const profileRouter = Router();

profileRouter.get('/', profileController.getAllProfiles);
profileRouter.get('/:profile_id', profileController.getProfileById);
profileRouter.post('/', profileController.createProfile);
profileRouter.put('/:profile_id', profileController.updateProfile);
profileRouter.delete('/:profile_id', profileController.deleteProfile);

export default profileRouter;