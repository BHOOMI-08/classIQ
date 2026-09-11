import { QuizResult } from '../models/quizResult.model.js';
import { resultsToCSV } from '../utils/csvExport.utils.js';

export class QuizExportService {
  static async exportResultsCSV(quizId) {
    const results = await QuizResult.find({ quizId })
      .populate('studentId', 'name email')
      .populate('attemptId', 'attemptNumber submittedAt autoSubmittedAt status')
      .lean();

    return resultsToCSV(results);
  }
}
