import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contentResourceService } from '../../../services/contentResourceService.js';
import { ArrowLeft, FileText, BookOpen, Link as LinkIcon, Upload, CheckCircle2 } from 'lucide-react';

export const CreateResourcePage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [resourceType, setResourceType] = useState('pdf');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('General');
  const [unit, setUnit] = useState('Unit 1');
  const [tags, setTags] = useState('homework, exam');
  const [allowDownload, setAllowDownload] = useState(true);

  // Payload inputs
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      if (resourceType === 'pdf' || resourceType === 'document') {
        if (!file) throw new Error('Please select a file to upload');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('resourceType', resourceType);
        formData.append('topic', topic);
        formData.append('unit', unit);
        formData.append('tags', tags);
        formData.append('allowDownload', String(allowDownload));
        formData.append('file', file);

        await contentResourceService.createResource(classId, formData);
      } else {
        const payload = {
          title,
          description,
          resourceType,
          topic,
          unit,
          tags,
          allowDownload,
          textContent: resourceType === 'text_note' ? textContent : '',
          externalUrl: resourceType === 'external_link' ? externalUrl : '',
        };
        await contentResourceService.createResource(classId, payload);
      }

      navigate(`/teacher/classes/${classId}/content`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create resource');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Link to={`/teacher/classes/${classId}/content`} className="btn-secondary btn-sm flex items-center gap-1 w-fit mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Content Workspace</span>
      </Link>

      <div className="card p-6">
        <h1 className="text-xl font-bold mb-1">Add Academic Resource</h1>
        <p className="text-sm text-secondary mb-6">
          Upload PDF/Document files, write text notes, or link external resources for RAG knowledge indexing.
        </p>

        {error && <div className="alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resource Type Selector */}
          <div>
            <label className="input-label">Select Resource Type</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setResourceType('pdf')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                  resourceType === 'pdf' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border'
                }`}
              >
                <FileText className="w-6 h-6" />
                <span className="text-xs">PDF / Document</span>
              </button>

              <button
                type="button"
                onClick={() => setResourceType('text_note')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                  resourceType === 'text_note' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border'
                }`}
              >
                <BookOpen className="w-6 h-6" />
                <span className="text-xs">Text Note</span>
              </button>

              <button
                type="button"
                onClick={() => setResourceType('external_link')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                  resourceType === 'external_link' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border'
                }`}
              >
                <LinkIcon className="w-6 h-6" />
                <span className="text-xs">External Link</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="input-label">Resource Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Chapter 4: Vector Calculus Reference Notes"
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

            <div className="md:col-span-2">
              <label className="input-label">Description</label>
              <textarea
                placeholder="Overview of resource topics and learning outcomes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[70px]"
              />
            </div>
          </div>

          {/* Input Variant */}
          {resourceType === 'pdf' && (
            <div>
              <label className="input-label">Upload PDF / Document File (Max 25MB)</label>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md"
                required
                onChange={(e) => setFile(e.target.files[0])}
                className="input-field"
              />
            </div>
          )}

          {resourceType === 'text_note' && (
            <div>
              <label className="input-label">Text Note Content (Markdown Supported)</label>
              <textarea
                required
                placeholder="Write or paste your academic note text here..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="input-field min-h-[160px] font-mono text-sm"
              />
            </div>
          )}

          {resourceType === 'external_link' && (
            <div>
              <label className="input-label">External Resource URL</label>
              <input
                type="url"
                required
                placeholder="https://example.edu/lecture-notes"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? (
                <>
                  <div className="spinner-sm"></div>
                  <span>Uploading & Indexing RAG Chunks...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Create & Process Resource</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
