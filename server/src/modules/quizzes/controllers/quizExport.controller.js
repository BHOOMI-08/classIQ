import { QuizExportService } from '../services/quizExport.service.js';

export const exportResultsCSV = async (req, res, next) => {
  try {
    const csv = await QuizExportService.exportResultsCSV(req.params.quizId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="quiz-results-${req.params.quizId}.csv"`);
    res.send(csv);
  } catch (err) { next(err); }
};
