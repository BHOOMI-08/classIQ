import { AttendanceExportService } from './attendanceExport.service.js';

export class AttendanceExportController {
  static exportSessionCsv = async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const csvData = await AttendanceExportService.exportSessionCsv(sessionId);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=session-attendance-${sessionId}.csv`);
      return res.status(200).send(csvData);
    } catch (err) {
      next(err);
    }
  };

  static exportClassroomCsv = async (req, res, next) => {
    try {
      const classroomId = req.params.classroomId || req.params.classId;
      const csvData = await AttendanceExportService.exportClassroomCsv(classroomId, req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=classroom-attendance-${classroomId}.csv`);
      return res.status(200).send(csvData);
    } catch (err) {
      next(err);
    }
  };
}
