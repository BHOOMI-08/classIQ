import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { requirePublishedResource } from '../middleware/requirePublishedResource.js';
import * as revisionController from '../controllers/revisionQueue.controller.js';

const router = Router();

router.use(authenticate);

router.post('/student/resources/:resourceId/revision', requirePublishedResource, revisionController.addToRevisionQueue);
router.delete('/student/resources/:resourceId/revision', requirePublishedResource, revisionController.removeFromRevisionQueue);
router.get('/student/revision', revisionController.getStudentRevisionQueue);

export default router;
