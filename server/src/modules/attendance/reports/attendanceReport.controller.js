import { CsvReportService } from './csvReport.service.js';
import { PdfReportService } from './pdfReport.service.js';

export class AttendanceReportController {
  static exportClassroomCsv = async (req, res, next) => {
    try {
      const classroomId = req.params.classroomId || req.params.classId;
      const csvData = await CsvReportService.generateClassroomCsv(classroomId);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=classroom-report-${classroomId}.csv`);
      return res.status(200).send(csvData);
    } catch (err) {
      next(err);
    }
  };

  static exportClassroomPdf = async (req, res, next) => {
    try {
      const classroomId = req.params.classroomId || req.params.classId;
      const pdfStream = await PdfReportService.generateClassroomPdfStream(classroomId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=classroom-report-${classroomId}.pdf`);
      pdfStream.pipe(res);
    } catch (err) {
      next(err);
    }
  };
}
