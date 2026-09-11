import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireResourceOwner } from '../middleware/requireResourceOwner.js';
import { requirePublishedResource } from '../middleware/requirePublishedResource.js';
import * as aiController from '../controllers/resourceAI.controller.js';

const router = Router();

router.use(authenticate);

router.post('/resources/:resourceId/ai/summary', authorize('teacher', 'admin'), requireResourceOwner, aiController.generateSummary);
router.post('/resources/:resourceId/ai/flashcards', authorize('teacher', 'admin'), requireResourceOwner, aiController.generateFlashcards);
router.post('/resources/:resourceId/ai/revision-questions', authorize('teacher', 'admin'), requireResourceOwner, aiController.generateRevisionQuestions);
router.get('/resources/:resourceId/ai/artifacts', requirePublishedResource, aiController.getArtifacts);

export default router;
