import { Router } from 'express';
import pulseRoutes from './pulse.routes.js';
import pollRoutes from './poll.routes.js';
import doubtRoutes from './doubt.routes.js';
import exitTicketRoutes from './exitTicket.routes.js';
import analyticsRoutes from './engagementAnalytics.routes.js';
import timelineRoutes from './classroomTimeline.routes.js';

const router = Router();

router.use('/', pulseRoutes);
router.use('/', pollRoutes);
router.use('/', doubtRoutes);
router.use('/', exitTicketRoutes);
router.use('/', analyticsRoutes);
router.use('/', timelineRoutes);

export default router;
