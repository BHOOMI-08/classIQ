import crypto from 'crypto';

/**
 * Crypto-safe Fisher-Yates shuffle using crypto.randomBytes for indices.
 */
export function cryptoShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const randomBytes = crypto.randomBytes(4);
    const randomValue = randomBytes.readUInt32BE(0);
    const j = randomValue % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick a random subset of `count` items from an array without repetition.
 */
export function randomSubset(array, count) {
  if (count >= array.length) return cryptoShuffle(array);
  return cryptoShuffle(array).slice(0, count);
}

/**
 * Topic-balanced subset: distribute `count` questions proportionally across topics.
 */
export function topicBalancedSubset(questions, count) {
  const byTopic = {};
  for (const q of questions) {
    const topic = q.topicSnapshot || q.topic || 'general';
    if (!byTopic[topic]) byTopic[topic] = [];
    byTopic[topic].push(q);
  }
  const topics = Object.keys(byTopic);
  const perTopic = Math.floor(count / topics.length);
  const remainder = count % topics.length;
  const selected = [];
  topics.forEach((topic, idx) => {
    const take = perTopic + (idx < remainder ? 1 : 0);
    selected.push(...randomSubset(byTopic[topic], take));
  });
  return cryptoShuffle(selected).slice(0, count);
}

/**
 * Difficulty-balanced subset: equal split across easy/medium/hard.
 */
export function difficultyBalancedSubset(questions, count) {
  const byDiff = { easy: [], medium: [], hard: [] };
  for (const q of questions) {
    const d = q.difficultySnapshot || q.difficulty || 'medium';
    if (byDiff[d]) byDiff[d].push(q);
  }
  const perDiff = Math.floor(count / 3);
  const remainder = count % 3;
  const selected = [
    ...randomSubset(byDiff.easy, perDiff + (remainder > 0 ? 1 : 0)),
    ...randomSubset(byDiff.medium, perDiff + (remainder > 1 ? 1 : 0)),
    ...randomSubset(byDiff.hard, perDiff),
  ];
  return cryptoShuffle(selected).slice(0, count);
}

/**
 * Generate per-question option ordering (stored per attempt — stable on reconnect).
 */
export function generateOptionOrders(questions) {
  const orders = {};
  for (const q of questions) {
    const qId = (q.originalQuestionId || q._id || q.questionId).toString();
    const optionIds = (q.optionSnapshot || []).map((o) => o._id.toString());
    orders[qId] = cryptoShuffle(optionIds);
  }
  return orders;
}
