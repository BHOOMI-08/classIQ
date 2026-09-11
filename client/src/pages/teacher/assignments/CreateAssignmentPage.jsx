import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { assignmentService } from '../../../services/assignmentService.js';
import { assignmentAIService } from '../../../services/assignmentAIService.js';
import { contentResourceService } from '../../../services/contentResourceService.js';

import { ArrowLeft, Sparkles, FileText, CheckCircle, BookOpen, Plus } from 'lucide-react';

export const CreateAssignmentPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [createMode, setCreateMode] = useState('manual');
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // Manual & Core Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [topic, setTopic] = useState('General');
  const [unit, setUnit] = useState('Unit 1');
  const [totalMarks, setTotalMarks] = useState(50);
  const [passingMarks, setPassingMarks] = useState(20);
  const [dueAt, setDueAt] = useState('');
  const [assignmentType, setAssignmentType] = useState('homework');
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedResourceIds, setSelectedResourceIds] = useState([]);

  // AI Generation Specific
  const [generating, setGenerating] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Module 4 resources for RAG grounding selection
    const loadResources = async () => {
      setLoadingResources(true);
      try {
        const res = await contentResourceService.getResources(classId);
        setResources(res?.data?.items || []);
      } catch (err) {
        console.error('Error loading resources:', err);
      } finally {
        setLoadingResources(false);
      }
    };
    loadResources();

    // Default dueAt to tomorrow at 23:59
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 0, 0);
    setDueAt(tomorrow.toISOString().slice(0, 16));
  }, [classId]);

  const handleAIGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await assignmentAIService.generateAssignment(classId, {
        resourceIds: selectedResourceIds,
        topic,
        unit,
        difficulty,
        totalMarks: Number(totalMarks),
        assignmentType,
      });

      const gen = res?.data?.assignment;
      if (gen) {
        setTitle(gen.title);
        setDescription(gen.description);
        setInstructions(gen.instructions || gen.tasks?.map((t) => `${t.title}: ${t.prompt}`).join('\n\n'));
        setTotalMarks(gen.totalMarks);
        setPassingMarks(Math.ceil(gen.totalMarks * 0.4));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'AI Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !instructions.trim() || !dueAt) return;

    setSubmitting(true);
    setError(null);
    try {
      await assignmentService.createAssignment(classId, {
        title,
        description,
        instructions,
        topic,
        unit,
        totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks),
        dueAt: new Date(dueAt).toISOString(),
        assignmentType,
        difficulty,
        linkedResourceIds: selectedResourceIds,
        status: 'draft',
      });
      navigate(`/teacher/classes/${classId}/assignments`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleResourceSelect = (id) => {
    setSelectedResourceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Link to={`/teacher/classes/${classId}/assignments`} className="btn-secondary btn-sm flex items-center gap-1 w-fit mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assignments</span>
      </Link>

      <div className="card p-6">
        <h1 className="text-xl font-bold mb-1">Create New Assignment</h1>
        <p className="text-sm text-secondary mb-6">
          Create manual assessments or generate RAG-grounded tasks using Module 4 classroom materials.
        </p>

        {error && <div className="alert-error mb-4">{error}</div>}

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setCreateMode('manual')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
              createMode === 'manual' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">Manual Entry</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateMode('ai_topic')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
              createMode === 'ai_topic' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-xs">AI Topic Generator</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateMode('rag_grounded')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
              createMode === 'rag_grounded' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">RAG Resource Grounded</span>
          </button>
        </div>

        {/* Module 4 Resource Selection for RAG Grounding */}
        {createMode === 'rag_grounded' && (
          <div className="mb-6 card p-4 border-dashed border-primary">
            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Select Module 4 Course Resources to Ground Assignment</span>
            </h3>
            {loadingResources ? (
              <div className="spinner-sm"></div>
            ) : resources.length === 0 ? (
              <p className="text-xs text-secondary">No published resources found in Module 4.</p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {resources.map((res) => (
                  <label key={res._id} className="flex items-center gap-2 text-xs cursor-pointer p-2 rounded hover:bg-surface">
                    <input
                      type="checkbox"
                      checked={selectedResourceIds.includes(res._id)}
                      onChange={() => toggleResourceSelect(res._id)}
                    />
                    <span className="font-semibold">{res.title}</span>
                    <span className="text-secondary">({res.topic} • {res.unit})</span>
                  </label>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={generating}
              className="btn-primary btn-sm mt-3 flex items-center gap-1"
            >
              {generating ? <div className="spinner-sm"></div> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Generate RAG Assignment</span>
            </button>
          </div>
        )}

        {createMode === 'ai_topic' && (
          <div className="mb-6 card p-4 border-dashed border-primary flex items-center justify-between">
            <span className="text-xs font-bold">Generate Assignment based on Topic & Unit</span>
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={generating}
              className="btn-primary btn-sm flex items-center gap-1"
            >
              {generating ? <div className="spinner-sm"></div> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Generate Assignment</span>
            </button>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="input-label">Assignment Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Midterm Lab 2: Vector Calculus & Derivatives"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Topic</label>
              <input
                type="text"
                placeholder="e.g. Linear Algebra"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Unit</label>
              <input
                type="text"
                placeholder="e.g. Unit 2"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Total Marks</label>
              <input
                type="number"
                required
                min="1"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Passing Marks</label>
              <input
                type="number"
                required
                min="0"
                value={passingMarks}
                onChange={(e) => setPassingMarks(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Due Date & Time</label>
              <input
                type="datetime-local"
                required
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Assignment Type</label>
              <select value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)} className="input-field">
                <option value="homework">Homework</option>
                <option value="project">Project</option>
                <option value="lab">Lab Assessment</option>
                <option value="essay">Essay</option>
                <option value="case_study">Case Study</option>
                <option value="coding">Coding Problem</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="input-label">Short Overview / Description</label>
              <textarea
                placeholder="Brief summary of assignment goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[60px]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="input-label">Full Instructions & Tasks</label>
              <textarea
                required
                placeholder="Detailed student instructions, questions, formulas, and task breakdowns..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="input-field min-h-[160px] font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? (
                <>
                  <div className="spinner-sm"></div>
                  <span>Saving Assignment...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save as Draft Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
