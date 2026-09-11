import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { SessionController } from './session.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(SessionController.getActiveSessions));
router.delete('/:sessionId', asyncHandler(SessionController.revokeSession));
router.post('/revoke-others', asyncHandler(SessionController.revokeOtherSessions));

export default router;
