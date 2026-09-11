import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { attendanceExportService } from '../../../services/attendanceExportService.js';

export const ExportAttendanceModal = ({ isOpen, onClose, classroomId, sessionId }) => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleExportSession = async () => {
    setDownloading(true);
    setError(null);
    try {
      if (sessionId) {
        await attendanceExportService.downloadSessionCsv(sessionId);
      } else {
        await attendanceExportService.downloadClassroomCsv(classroomId);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to export CSV');
    } finally {
      setDownloading(false);
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

        <div className="text-sm text-muted mb-4">
          Export sanitized attendance data as a CSV spreadsheet. Contains student names, roll numbers, status, marked times, and late minutes.
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <button onClick={onClose} className="btn-secondary" disabled={downloading}>
            Cancel
          </button>
          <button onClick={handleExportSession} className="btn-primary flex items-center space-x-2" disabled={downloading}>
            <FileText className="w-4 h-4" />
            <span>{downloading ? 'Generating CSV...' : 'Download CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
