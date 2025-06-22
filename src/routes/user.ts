import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { userSchemaFields } from '../validations/userValidation';
import { zodValidation } from '../middlewares/errorsMiddleware';

const router = Router();

router.post('/', zodValidation(userSchemaFields), userController.create);
router.get('/', userController.getAll);

export default router;
