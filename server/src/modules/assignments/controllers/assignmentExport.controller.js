import { AssignmentExportService } from '../services/assignmentExport.service.js';

export const exportCSV = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const csvContent = await AssignmentExportService.exportCSV(assignmentId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="assignment_${assignmentId}_results.csv"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
};
