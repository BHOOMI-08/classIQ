import { Doubt } from '../models/doubt.model.js';
import { DoubtCluster } from '../models/doubtCluster.model.js';
import { DoubtClusterMember } from '../models/doubtClusterMember.model.js';
import { calculateKeywordSimilarity } from '../utils/textSimilarity.utils.js';
import { logger } from '../../../utils/logger.js';

export class DoubtClusteringService {
  /**
   * Group unresolved doubts in a classroom into clusters based on topic & similarity.
   */
  static async clusterUnresolvedDoubts(classroomId) {
    const unresolvedDoubts = await Doubt.find({
      classroomId,
      status: { $in: ['open', 'grouped', 'acknowledged'] },
    }).lean();

    if (unresolvedDoubts.length < 2) {
      return { clustersCreated: 0 };
    }

    // Group doubts by topic first
    const topicGroups = {};
    unresolvedDoubts.forEach((d) => {
      const t = d.topic || 'General';
      if (!topicGroups[t]) topicGroups[t] = [];
      topicGroups[t].push(d);
    });

    let clustersCreated = 0;

    for (const [topicName, group] of Object.entries(topicGroups)) {
      if (group.length < 2) continue;

      // Group similar doubts within topic
      const visited = new Set();

      for (let i = 0; i < group.length; i++) {
        const doubtA = group[i];
        if (visited.has(doubtA._id.toString())) continue;

        const clusterMembers = [doubtA];
        visited.add(doubtA._id.toString());

        for (let j = i + 1; j < group.length; j++) {
          const doubtB = group[j];
          if (visited.has(doubtB._id.toString())) continue;

          const sim = calculateKeywordSimilarity(doubtA.normalizedText, doubtB.normalizedText);
          if (sim >= 0.35) {
            clusterMembers.push(doubtB);
            visited.add(doubtB._id.toString());
          }
        }

        if (clusterMembers.length >= 2) {
          // Find representative doubt (highest upvotes / priority)
          clusterMembers.sort((a, b) => b.upvoteCount - a.upvoteCount);
          const representative = clusterMembers[0];
          const totalUpvotes = clusterMembers.reduce((sum, m) => sum + m.upvoteCount, 0);

          const cluster = await DoubtCluster.create({
            classroomId,
            topic: topicName,
            title: `Cluster: ${representative.text.substring(0, 60)}...`,
            representativeDoubtId: representative._id,
            memberCount: clusterMembers.length,
            totalUpvotes,
            priorityScore: representative.priorityScore + totalUpvotes,
            confidence: 0.85,
            status: 'active',
          });

          const memberDocs = clusterMembers.map((m) => ({
            clusterId: cluster._id,
            doubtId: m._id,
            similarityScore: calculateKeywordSimilarity(representative.normalizedText, m.normalizedText),
          }));

          await DoubtClusterMember.insertMany(memberDocs, { ordered: false }).catch(() => {});

          // Update doubt status to grouped
          await Doubt.updateMany(
            { _id: { $in: clusterMembers.map((m) => m._id) } },
            { $set: { status: 'grouped', clusterId: cluster._id } }
          );

          clustersCreated += 1;
        }
      }
    }

    logger.info(`Doubt clustering complete for classroom ${classroomId}: ${clustersCreated} clusters created.`);
    return { clustersCreated };
  }
}
