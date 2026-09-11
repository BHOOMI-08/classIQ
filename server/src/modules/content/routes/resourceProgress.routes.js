import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { requirePublishedResource } from '../middleware/requirePublishedResource.js';
import * as progressController from '../controllers/resourceProgress.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/student/resources/:resourceId/open', requirePublishedResource, progressController.recordOpen);
router.post('/student/resources/:resourceId/complete', requirePublishedResource, progressController.markCompleted);
router.patch('/student/resources/:resourceId/progress', requirePublishedResource, progressController.updateProgress);

export default router;
