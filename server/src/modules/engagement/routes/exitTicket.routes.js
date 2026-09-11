import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import {
  createExitTicketSchema,
  generateAIExitTicketSchema,
  submitExitTicketSchema,
} from '../validation/engagement.validation.js';
import {
  createExitTicket,
  generateAIExitTicket,
  getClassroomExitTickets,
  getExitTicketById,
  startExitTicket,
  submitExitTicketAttempt,
  closeExitTicket,
} from '../controllers/exitTicket.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/classes/:classId/exit-tickets', authorize('teacher', 'admin'), validate(createExitTicketSchema), createExitTicket);
router.post('/classes/:classId/exit-tickets/ai/generate', authorize('teacher', 'admin'), validate(generateAIExitTicketSchema), generateAIExitTicket);
router.get('/classes/:classId/exit-tickets', getClassroomExitTickets);
router.get('/exit-tickets/:ticketId', getExitTicketById);
router.post('/exit-tickets/:ticketId/start', authorize('teacher', 'admin'), startExitTicket);
router.post('/student/exit-tickets/:ticketId/submit', authorize('student'), validate(submitExitTicketSchema), submitExitTicketAttempt);
router.post('/exit-tickets/:ticketId/close', authorize('teacher', 'admin'), closeExitTicket);

export default router;
