import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { attendanceReportService } from '../../../services/attendanceReportService.js';

export const ExportReportModal = ({ isOpen, onClose, classroomId }) => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleExportCsv = async () => {
    setExporting(true);
    setError(null);
    try {
      await attendanceReportService.downloadClassroomCsv(classroomId);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    setError(null);
    try {
      await attendanceReportService.downloadClassroomPdf(classroomId);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card w-full max-w-md p-6 bg-surface border border-border">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Export Attendance Report</h3>
          </div>
          <button onClick={onClose} className="btn-icon">×</button>
        </div>

        {error && <div className="alert alert-danger mb-4">{error}</div>}

        <p className="text-sm text-muted mb-6">
          Choose export format for classroom academic attendance records. Reports contain student roll numbers, status breakdown, and timestamp records.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="p-4 rounded-xl border border-border bg-surface-variant/50 hover:bg-surface-variant text-center flex flex-col items-center justify-center space-y-2 transition-all"
          >
            <FileSpreadsheet className="w-8 h-8 text-success" />
            <span className="font-bold text-sm">Export CSV</span>
            <span className="text-xs text-muted">Spreadsheet Format</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="p-4 rounded-xl border border-border bg-surface-variant/50 hover:bg-surface-variant text-center flex flex-col items-center justify-center space-y-2 transition-all"
          >
            <FileText className="w-8 h-8 text-danger" />
            <span className="font-bold text-sm">Export PDF</span>
            <span className="text-xs text-muted">Official Academic Document</span>
          </button>
        </div>

        <div className="flex justify-end pt-3 border-t border-border">
          <button onClick={onClose} className="btn-secondary" disabled={exporting}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
