import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { attendanceReportService } from '../../../services/attendanceReportService.js';
import { Download, FileSpreadsheet, FileText, ArrowLeft } from 'lucide-react';

export const AttendanceReportsPage = () => {
  const { classId } = useParams();

  const handleDownloadCsv = () => attendanceReportService.downloadClassroomCsv(classId);
  const handleDownloadPdf = () => attendanceReportService.downloadClassroomPdf(classId);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="flex items-center space-x-2 mb-6">
        <Link to={`/teacher/classes/${classId}/attendance`} className="btn-secondary btn-sm flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Attendance Hub</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold flex items-center space-x-2 mb-2">
        <Download className="w-7 h-7 text-primary" />
        <span>Academic Reports Export Center</span>
      </h1>
      <p className="text-muted text-sm mb-6">
        Download official CSV spreadsheet reports and PDF academic attendance summaries.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 flex flex-col justify-between items-start">
          <div>
            <FileSpreadsheet className="w-10 h-10 text-success mb-3" />
            <h3 className="font-bold text-lg mb-1">CSV Spreadsheet Export</h3>
            <p className="text-xs text-muted mb-4">
              Sanitized CSV data containing complete attendance records, roll numbers, status breakdown, and late arrival minutes.
            </p>
          </div>
          <button onClick={handleDownloadCsv} className="btn-primary w-full flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download CSV Report</span>
          </button>
        </div>

        <div className="card p-6 flex flex-col justify-between items-start">
          <div>
            <FileText className="w-10 h-10 text-danger mb-3" />
            <h3 className="font-bold text-lg mb-1">Official PDF Document Export</h3>
            <p className="text-xs text-muted mb-4">
              Formatted PDF academic document complete with institution header, summary metrics, and attendance log.
            </p>
          </div>
          <button onClick={handleDownloadPdf} className="btn-primary w-full flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download PDF Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
