import { ClassroomPulse } from '../models/classroomPulse.model.js';
import { Poll } from '../models/poll.model.js';
import { ExitTicket } from '../models/exitTicket.model.js';
import { PulseService } from '../services/pulse.service.js';
import { PollService } from '../services/poll.service.js';
import { ExitTicketService } from '../services/exitTicket.service.js';
import { logger } from '../../../utils/logger.js';

export class EngagementLifecycleWorker {
  static async processExpiredSessions() {
    const now = new Date();

    try {
      // 1. Auto-close expired pulses
      const expiredPulses = await ClassroomPulse.find({ status: 'active', endsAt: { $lte: now } });
      for (const pulse of expiredPulses) {
        await PulseService.closePulse(pulse.teacherId, pulse._id).catch(() => {});
      }

      // 2. Auto-close expired polls
      const expiredPolls = await Poll.find({ status: 'active', endsAt: { $lte: now } });
      for (const poll of expiredPolls) {
        await PollService.closePoll(poll.teacherId, poll._id).catch(() => {});
      }

      // 3. Auto-close expired exit tickets
      const expiredTickets = await ExitTicket.find({ status: 'active', endsAt: { $lte: now } });
      for (const ticket of expiredTickets) {
        await ExitTicketService.closeExitTicket(ticket.teacherId, ticket._id).catch(() => {});
      }
    } catch (err) {
      logger.error('Error in EngagementLifecycleWorker:', { error: err.message });
    }
  }
}
