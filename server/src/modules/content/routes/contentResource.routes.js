import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireClassroomOwner } from '../../../middleware/classroomAccess.js';
import { requireResourceOwner } from '../middleware/requireResourceOwner.js';
import { requirePublishedResource } from '../middleware/requirePublishedResource.js';
import { uploadResourceFile } from '../middleware/validateResourceFile.js';
import * as resourceController from '../controllers/contentResource.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/classes/:classId/resources', resourceController.getClassroomResources);

router.post(
  '/classes/:classId/resources/upload',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  uploadResourceFile.single('file'),
  resourceController.createResource
);

router.get('/resources/:resourceId', requirePublishedResource, resourceController.getResourceDetails);

router.post('/resources/:resourceId/publish', authorize('teacher', 'admin'), requireResourceOwner, resourceController.publishResource);
router.post('/resources/:resourceId/unpublish', authorize('teacher', 'admin'), requireResourceOwner, resourceController.unpublishResource);

router.post(
  '/resources/:resourceId/versions',
  authorize('teacher', 'admin'),
  requireResourceOwner,
  uploadResourceFile.single('file'),
  resourceController.replaceFileVersion
);

router.get('/resources/:resourceId/versions', authorize('teacher', 'admin'), requireResourceOwner, resourceController.getResourceVersions);

export default router;
