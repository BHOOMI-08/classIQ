import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import {
  chatTutor,
  getTutorHistory,
  getTutorMessages,
  deleteTutorHistory,
} from '../controllers/tutor.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize('student'));

router.post('/chat', chatTutor);
router.get('/history', getTutorHistory);
router.get('/history/:id', getTutorMessages);
router.delete('/history/:id', deleteTutorHistory);

export default router;
