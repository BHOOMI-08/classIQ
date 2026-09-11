import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assignmentService } from '../../../services/assignmentService.js';
import { rubricService } from '../../../services/rubricService.js';
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle,
  Users,
  Copy,
  BarChart2,
  Calendar,
  Sparkles,
  Layers,
  Plus,
} from 'lucide-react';

export const TeacherAssignmentDetailsPage = () => {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [rubric, setRubric] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Rubric creation state
  const [rubricTitle, setRubricTitle] = useState('');
  const [criteria, setCriteria] = useState([
    { title: 'Conceptual Accuracy', maximumMarks: 25, description: 'Correct theory' },
    { title: 'Execution & Problem Solving', maximumMarks: 25, description: 'Step correctness' },
  ]);
  const [creatingRubric, setCreatingRubric] = useState(false);

  const loadDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [assRes, rubRes] = await Promise.all([
        assignmentService.getAssignmentDetails(assignmentId),
        rubricService.getRubric(assignmentId),
      ]);
      setAssignment(assRes?.data?.assignment);
      setRubric(rubRes?.data?.rubric);
    } catch (err) {
      console.error('Error loading details:', err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handlePublish = async () => {
    try {
      await assignmentService.publishAssignment(assignmentId);
      await loadDetails();
    } catch (err) {
      console.error('Error publishing:', err);
    }
  };

  const handleCreateRubric = async (e) => {
    e.preventDefault();
    setCreatingRubric(true);
    try {
      await rubricService.createRubric(assignmentId, {
        title: rubricTitle || `${assignment.title} Rubric`,
        totalMarks: assignment.totalMarks,
        criteria,
      });
      await loadDetails();
    } catch (err) {
      console.error('Error creating rubric:', err);
    } finally {
      setCreatingRubric(false);
    }
  };

  if (loading || !assignment) {
    return (
      <div className="flex justify-center p-12">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <Link to={`/teacher/classes/${assignment.classroomId}/assignments`} className="btn-secondary btn-sm flex items-center gap-1 w-fit mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Class Assignments</span>
      </Link>

      {/* Banner */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{assignment.title}</h1>
              <span className={`badge text-xs font-bold ${assignment.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                {assignment.status}
              </span>
            </div>
            <p className="text-sm text-secondary mb-3">{assignment.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-secondary">
              <span>Topic: <strong>{assignment.topic}</strong></span>
              <span>Unit: <strong>{assignment.unit}</strong></span>
              <span>Total Marks: <strong>{assignment.totalMarks}</strong></span>
              <span>Due Date: <strong>{new Date(assignment.dueAt).toLocaleString()}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {assignment.status === 'draft' && (
              <button onClick={handlePublish} className="btn-primary btn-sm">
                Publish Assignment
              </button>
            )}
            <Link to={`/teacher/assignments/${assignment._id}/submissions`} className="btn-secondary btn-sm flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Submissions ({assignment.totalSubmissions})</span>
            </Link>
            <Link to={`/teacher/assignments/${assignment._id}/analytics`} className="btn-secondary btn-sm flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium text-sm border-b-2 flex items-center gap-2 ${
            activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-secondary'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Instructions & Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab('rubric')}
          className={`px-4 py-2 font-medium text-sm border-b-2 flex items-center gap-2 ${
            activeTab === 'rubric' ? 'border-primary text-primary' : 'border-transparent text-secondary'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Grading Rubric</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-lg mb-2">Student Instructions</h3>
          <div className="bg-surface p-4 rounded-lg text-sm font-mono whitespace-pre-wrap border border-border">
            {assignment.instructions}
          </div>
        </div>
      )}

      {activeTab === 'rubric' && (
        <div className="space-y-6">
          {rubric ? (
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-2">{rubric.title}</h3>
              <p className="text-xs text-secondary mb-4">Total Rubric Marks: {rubric.totalMarks}</p>
              <div className="space-y-3">
                {rubric.criteria?.map((c) => (
                  <div key={c._id} className="p-3 border rounded-lg bg-surface">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm">{c.title}</span>
                      <span className="badge badge-info text-xs font-bold">{c.maximumMarks} Marks</span>
                    </div>
                    <p className="text-xs text-secondary">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-6">
              <h3 className="font-bold text-base mb-3">Create Grading Rubric</h3>
              <form onSubmit={handleCreateRubric} className="space-y-4">
                <div>
                  <label className="input-label">Rubric Title</label>
                  <input
                    type="text"
                    placeholder={`${assignment.title} Rubric`}
                    value={rubricTitle}
                    onChange={(e) => setRubricTitle(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="space-y-3">
                  <label className="input-label">Criteria Breakdown (Total must equal {assignment.totalMarks} Marks)</label>
                  {criteria.map((crit, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Criterion Title"
                        value={crit.title}
                        onChange={(e) => {
                          const copy = [...criteria];
                          copy[idx].title = e.target.value;
                          setCriteria(copy);
                        }}
                        className="input-field flex-1"
                      />
                      <input
                        type="number"
                        placeholder="Marks"
                        value={crit.maximumMarks}
                        onChange={(e) => {
                          const copy = [...criteria];
                          copy[idx].maximumMarks = Number(e.target.value);
                          setCriteria(copy);
                        }}
                        className="input-field w-24"
                      />
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={creatingRubric} className="btn-primary btn-sm flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  <span>Save Rubric</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
