import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateProfileSchema } from '../validators/auth.validator';

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => profileController.getProfile(req, res));
router.put('/', validateBody(updateProfileSchema), (req, res) => profileController.updateProfile(req, res));

export default router;
