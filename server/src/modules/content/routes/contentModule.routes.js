import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireClassroomOwner } from '../../../middleware/classroomAccess.js';
import * as moduleController from '../controllers/contentModule.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/classes/:classId/content/modules', moduleController.getClassroomModules);

router.post(
  '/classes/:classId/content/modules',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  moduleController.createModule
);

router.patch(
  '/classes/:classId/content/modules/:moduleId',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  moduleController.updateModule
);

router.post(
  '/classes/:classId/content/modules/:moduleId/archive',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  moduleController.archiveModule
);

router.post(
  '/classes/:classId/content/modules/:moduleId/restore',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  moduleController.restoreModule
);

export default router;
