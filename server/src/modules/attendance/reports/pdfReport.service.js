import PDFDocument from 'pdfkit';
import { Classroom } from '../../classrooms/classroom.model.js';
import { AttendanceRecord } from '../attendanceRecord.model.js';
import { StudentProfile } from '../../profiles/student-profile.model.js';
import { ApiError } from '../../../utils/api-error.js';

export class PdfReportService {
  /**
   * Generate PDF report stream for a classroom attendance summary.
   */
  static async generateClassroomPdfStream(classroomId) {
    const classroom = await Classroom.findById(classroomId).lean();
    if (!classroom) throw ApiError.notFound('Classroom not found');

    const records = await AttendanceRecord.find({ classroomId })
      .populate('studentId', 'name email')
      .populate('sessionId', 'title startedAt')
      .sort({ markedAt: -1 })
      .limit(200)
      .lean();

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // Document Header
    doc
      .fontSize(20)
      .fillColor('#1E293B')
      .text('ClassIQ Official Attendance Report', { align: 'center' });

    doc
      .fontSize(12)
      .fillColor('#64748B')
      .text(`Classroom: ${classroom.name} (${classroom.subjectName || ''})`, { align: 'center' })
      .text(`Course Code: ${classroom.courseCode || 'N/A'} | Generated: ${new Date().toLocaleDateString()}`, { align: 'center' })
      .moveDown(1.5);

    // Summary Section
    doc
      .fontSize(14)
      .fillColor('#0F172A')
      .text('Summary Overview', { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor('#334155')
      .text(`Total Recorded Entries: ${records.length}`)
      .text(`Required Attendance Threshold: ${classroom.attendanceThreshold || 75}%`)
      .moveDown(1.5);

    // Table Header
    doc
      .fontSize(11)
      .fillColor('#1E293B')
      .text('Student Name               Session Title           Status       Marked Time', { underline: true })
      .moveDown(0.5);

    // Table Rows
    doc.fontSize(9).fillColor('#475569');
    for (const r of records.slice(0, 40)) {
      const studentName = (r.studentId?.name || 'Student').padEnd(25).slice(0, 25);
      const sessionTitle = (r.sessionId?.title || 'Session').padEnd(20).slice(0, 20);
      const status = (r.status || 'present').toUpperCase().padEnd(12);
      const time = r.markedAt ? new Date(r.markedAt).toLocaleTimeString() : 'N/A';

      doc.text(`${studentName} ${sessionTitle} ${status} ${time}`);
    }

    doc.moveDown(2);
    doc.fontSize(8).fillColor('#94A3B8').text('ClassIQ Smart & Secure Attendance Analytics System — Official Export', { align: 'center' });

    doc.end();
    return doc;
  }
}
