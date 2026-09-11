import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { getConfusionHeatmap, getEngagementOverview } from '../controllers/engagementAnalytics.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/classes/:classId/engagement/confusion-heatmap', getConfusionHeatmap);
router.get('/classes/:classId/engagement/overview', getEngagementOverview);

export default router;
