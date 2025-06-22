import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { userSchemaFields } from '../validations/UserValidation';
import { zodValidation } from '../middlewares/ErrorsMiddleware';

const router = Router();

router.post('/', zodValidation(userSchemaFields), userController.create);
router.get('/', userController.getAll);

export default router;
