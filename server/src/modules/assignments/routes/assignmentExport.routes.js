import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireAssignmentOwner } from '../middleware/requireAssignmentOwner.js';
import * as exportController from '../controllers/assignmentExport.controller.js';

const router = Router();

router.use(authenticate);

router.get(
  '/assignments/:assignmentId/export/results.csv',
  authorize('teacher', 'admin'),
  requireAssignmentOwner,
  exportController.exportCSV
);

export default router;
