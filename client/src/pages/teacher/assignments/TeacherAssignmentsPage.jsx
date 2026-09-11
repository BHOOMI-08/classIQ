import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assignmentService } from '../../../services/assignmentService.js';
import {
  ClipboardList,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle,
  Eye,
  Copy,
  Archive,
  BarChart2,
  Users,
} from 'lucide-react';

export const TeacherAssignmentsPage = () => {
  const { classId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assignmentService.getAssignments(classId);
      setAssignments(res?.data?.items || []);
    } catch (err) {
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handlePublish = async (assignmentId) => {
    try {
      await assignmentService.publishAssignment(assignmentId);
      await loadAssignments();
    } catch (err) {
      console.error('Error publishing assignment:', err);
    }
  };

  const handleDuplicate = async (assignmentId) => {
    try {
      await assignmentService.duplicateAssignment(assignmentId);
      await loadAssignments();
    } catch (err) {
      console.error('Error duplicating assignment:', err);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (filterStatus === 'published') return a.status === 'published' || a.status === 'active';
    if (filterStatus === 'draft') return a.status === 'draft' || a.status === 'scheduled';
    return true;
  });

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            <span>Classroom Assignments</span>
          </h1>
          <p className="text-sm text-secondary">
            Manage course assessments, rubrics, submissions, and AI-assisted generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/teacher/classes/${classId}/assignments/new`}
            className="btn-primary btn-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>New Assignment</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All ({assignments.length})
        </button>
        <button
          onClick={() => setFilterStatus('published')}
          className={`btn-sm ${filterStatus === 'published' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Published ({assignments.filter((a) => a.status === 'published' || a.status === 'active').length})
        </button>
        <button
          onClick={() => setFilterStatus('draft')}
          className={`btn-sm ${filterStatus === 'draft' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Drafts & Scheduled ({assignments.filter((a) => a.status === 'draft' || a.status === 'scheduled').length})
        </button>
      </div>

      {/* Assignment Cards List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="spinner"></div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList className="w-12 h-12 text-secondary mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold mb-1">No Assignments Found</h3>
          <p className="text-sm text-secondary mb-4">Create manual assignments or generate them using AI/RAG grounding.</p>
          <Link to={`/teacher/classes/${classId}/assignments/new`} className="btn-primary">
            Create First Assignment
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((a) => (
            <div key={a._id} className="card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-primary/50 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{a.title}</h3>
                  <span className={`badge text-xs font-bold ${a.status === 'published' || a.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {a.status}
                  </span>
                  {a.aiGenerated && (
                    <span className="badge badge-info text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Generated</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-secondary mb-3 line-clamp-1">{a.description || a.instructions}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-secondary">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due: <strong>{new Date(a.dueAt).toLocaleDateString()}</strong></span>
                  </span>
                  <span>Total Marks: <strong>{a.totalMarks}</strong></span>
                  <span>Pass Marks: <strong>{a.passingMarks}</strong></span>
                  <span>Submissions: <strong>{a.totalSubmissions}</strong></span>
                  <span>Graded: <strong>{a.gradedSubmissions}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                {a.status === 'draft' && (
                  <button onClick={() => handlePublish(a._id)} className="btn-primary btn-sm">
                    Publish
                  </button>
                )}
                <button onClick={() => handleDuplicate(a._id)} title="Duplicate Assignment" className="btn-secondary btn-sm p-2">
                  <Copy className="w-4 h-4" />
                </button>
                <Link to={`/teacher/assignments/${a._id}/submissions`} className="btn-secondary btn-sm flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Submissions</span>
                </Link>
                <Link to={`/teacher/assignments/${a._id}/analytics`} className="btn-secondary btn-sm p-2" title="Analytics">
                  <BarChart2 className="w-4 h-4" />
                </Link>
                <Link to={`/teacher/assignments/${a._id}`} className="btn-secondary btn-sm p-2" title="Manage">
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
