import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assignmentService } from '../../../services/assignmentService.js';
import { ClipboardList, Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export const StudentAssignmentsPage = () => {
  const { classId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStudentAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assignmentService.getAssignments(classId);
      setAssignments(res?.data?.items || []);
    } catch (err) {
      console.error('Error loading student assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadStudentAssignments();
  }, [loadStudentAssignments]);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
          <ClipboardList className="w-6 h-6 text-primary" />
          <span>Course Assignments</span>
        </h1>
        <p className="text-sm text-secondary">View upcoming due dates, submit coursework, and check grade results.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="spinner"></div>
        </div>
      ) : assignments.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList className="w-12 h-12 text-secondary mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold mb-1">No Active Assignments</h3>
          <p className="text-sm text-secondary">Your instructor has not published any assignments yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <div key={a._id} className="card p-5 flex flex-col justify-between hover:border-primary/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-secondary text-xs uppercase">{a.assignmentType}</span>
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due {new Date(a.dueAt).toLocaleDateString()}</span>
                  </span>
                </div>

                <h3 className="font-bold text-base mb-1 line-clamp-1">{a.title}</h3>
                <p className="text-xs text-secondary mb-3 line-clamp-2">{a.description || a.instructions}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs font-bold">Total Marks: {a.totalMarks}</span>
                <Link to={`/student/assignments/${a._id}`} className="btn-primary btn-sm flex items-center gap-1">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
