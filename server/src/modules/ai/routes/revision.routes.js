import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import {
  generateRevision,
  getRevisions,
  getRevisionById,
} from '../controllers/revision.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize('student'));

router.post('/generate', generateRevision);
router.get('/', getRevisions);
router.get('/:id', getRevisionById);

export default router;
