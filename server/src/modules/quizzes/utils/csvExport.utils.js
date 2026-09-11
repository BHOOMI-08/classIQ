/**
 * Serialize quiz result records to CSV string.
 */
export function resultsToCSV(results) {
  const headers = ['Student Name', 'Email', 'Attempt #', 'Status', 'Final Marks', 'Total Marks', 'Percentage', 'Grade', 'Passed', 'Time Taken (s)', 'Submitted At'];
  const rows = results.map((r) => [
    r.studentId?.name || '',
    r.studentId?.email || '',
    r.attemptId?.attemptNumber || '',
    r.status,
    r.finalMarks,
    r.totalMarks,
    r.percentage?.toFixed(1) || '0.0',
    r.gradeLabel,
    r.passed ? 'Yes' : 'No',
    r.timeTakenSeconds || 0,
    r.attemptId?.submittedAt ? new Date(r.attemptId.submittedAt).toISOString() : '',
  ]);

  const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;
  const csvLines = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))];
  return csvLines.join('\n');
}
