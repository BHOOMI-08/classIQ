import { ClassroomPulse } from '../models/classroomPulse.model.js';
import { PulseResponse } from '../models/pulseResponse.model.js';
import { ExitTicket } from '../models/exitTicket.model.js';
import { ExitTicketAttempt } from '../models/exitTicketAttempt.model.js';
import { Doubt } from '../models/doubt.model.js';
import { ResourceProgress } from '../../content/models/resourceProgress.model.js';
import { QuizResult } from '../../quizzes/models/quizResult.model.js';
import { EngagementAnalyticsSnapshot } from '../models/engagementAnalyticsSnapshot.model.js';
import { calculateTopicConfusionScore } from '../utils/engagementScoring.utils.js';

export class ConfusionHeatmapService {
  /**
   * Calculate Topic Confusion Heatmap across Module 4, 6, and 8 signals.
   */
  static async calculateConfusionHeatmap(classroomId) {
    // Collect distinct topics from pulses, exit tickets, doubts
    const topics = new Set();

    const pulses = await ClassroomPulse.find({ classroomId }).lean();
    pulses.forEach((p) => { if (p.topic) topics.add(p.topic); });

    const tickets = await ExitTicket.find({ classroomId }).lean();
    tickets.forEach((t) => { if (t.topic) topics.add(t.topic); });

    const doubts = await Doubt.find({ classroomId }).lean();
    doubts.forEach((d) => { if (d.topic) topics.add(d.topic); });

    if (topics.size === 0) topics.add('General');

    const heatmap = [];

    for (const topicName of topics) {
      // 1. Module 6 Quiz Error Rate
      const quizScores = await QuizResult.find({ classroomId }).lean();
      let quizErrorRate = 20; // Default baseline if no quiz data
      if (quizScores.length > 0) {
        const avgPercentage = quizScores.reduce((sum, s) => sum + (s.percentage || 0), 0) / quizScores.length;
        quizErrorRate = Math.max(0, 100 - avgPercentage);
      }

      // 2. Module 8 Exit Ticket Error Rate
      const topicTicketIds = tickets.filter((t) => t.topic === topicName).map((t) => t._id);
      const ticketAttempts = await ExitTicketAttempt.find({ exitTicketId: { $in: topicTicketIds } }).lean();
      let exitTicketErrorRate = 25;
      if (ticketAttempts.length > 0) {
        const avgTicketAcc = ticketAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / ticketAttempts.length;
        exitTicketErrorRate = Math.max(0, 100 - avgTicketAcc);
      }

      // 3. Module 8 Pulse Confusion Rate
      const topicPulseIds = pulses.filter((p) => p.topic === topicName).map((p) => p._id);
      const pulseResponses = await PulseResponse.find({ pulseId: { $in: topicPulseIds } }).lean();
      let pulseConfusionRate = 30;
      if (pulseResponses.length > 0) {
        const confusedCount = pulseResponses.filter((r) => r.response === 'confused' || r.response === 'partially_clear').length;
        pulseConfusionRate = Number(((confusedCount / pulseResponses.length) * 100).toFixed(1));
      }

      // 4. Module 8 Doubt Intensity
      const topicDoubts = doubts.filter((d) => d.topic === topicName);
      const doubtIntensity = Math.min(100, topicDoubts.length * 15 + topicDoubts.reduce((sum, d) => sum + d.upvoteCount, 0) * 5);

      // 5. Module 4 Revision Frequency
      const revisionRecords = await ResourceProgress.find({ classroomId }).lean();
      const revisionFrequency = Math.min(100, revisionRecords.length * 5);

      const scoreObj = calculateTopicConfusionScore({
        quizErrorRate,
        exitTicketErrorRate,
        pulseConfusionRate,
        doubtIntensity,
        revisionFrequency,
      });

      const entry = {
        topic: topicName,
        confusionScore: scoreObj.confusionScore,
        classification: scoreObj.classification,
        evidence: {
          quizErrorRate: Math.round(quizErrorRate),
          exitTicketErrorRate: Math.round(exitTicketErrorRate),
          pulseConfusionRate: Math.round(pulseConfusionRate),
          doubtCount: topicDoubts.length,
          doubtIntensity: Math.round(doubtIntensity),
          revisionFrequency: Math.round(revisionFrequency),
        },
      };

      heatmap.push(entry);

      // Save Snapshot
      await EngagementAnalyticsSnapshot.create({
        classroomId,
        snapshotType: 'topic_confusion',
        topic: topicName,
        metrics: {
          quizErrorRate: Math.round(quizErrorRate),
          exitTicketErrorRate: Math.round(exitTicketErrorRate),
          pulseConfusionRate: Math.round(pulseConfusionRate),
          doubtIntensity: Math.round(doubtIntensity),
          revisionFrequency: Math.round(revisionFrequency),
          confusionScore: scoreObj.confusionScore,
        },
        classification: scoreObj.classification,
        evidence: entry.evidence,
      });
    }

    heatmap.sort((a, b) => b.confusionScore - a.confusionScore);
    return heatmap;
  }
}
