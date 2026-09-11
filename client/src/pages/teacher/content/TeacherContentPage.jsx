import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentModuleService } from '../../../services/contentModuleService.js';
import { contentResourceService } from '../../../services/contentResourceService.js';

import {
  BookOpen,
  Plus,
  FileText,
  Upload,
  Link as LinkIcon,
  CheckCircle,
  Eye,
  Trash2,
  FolderPlus,
  RefreshCw,
  Search,
} from 'lucide-react';

export const TeacherContentPage = () => {
  const { classId } = useParams();
  const [modules, setModules] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  const loadContentData = useCallback(async () => {
    setLoading(true);
    try {
      const [modRes, resRes] = await Promise.all([
        contentModuleService.getModules(classId),
        contentResourceService.getResources(classId),
      ]);
      setModules(modRes?.data?.items || []);
      setResources(resRes?.data?.items || []);
    } catch (err) {
      console.error('Error loading content data:', err);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadContentData();
  }, [loadContentData]);

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    try {
      await contentModuleService.createModule(classId, {
        title: newModuleTitle,
        description: newModuleDesc,
      });
      setNewModuleTitle('');
      setNewModuleDesc('');
      setIsModuleModalOpen(false);
      await loadContentData();
    } catch (err) {
      console.error('Error creating module:', err);
    }
  };

  const handlePublishToggle = async (resource) => {
    try {
      if (resource.status === 'published') {
        await contentResourceService.unpublishResource(resource._id);
      } else {
        await contentResourceService.publishResource(resource._id);
      }
      await loadContentData();
    } catch (err) {
      console.error('Error publishing resource:', err);
    }
  };

  const filteredResources = resources.filter((res) =>
    res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span>Learning Resources & Modules</span>
          </h1>
          <p className="text-sm text-secondary">
            Manage academic files, notes, links, version replacements, and RAG index status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsModuleModalOpen(true)}
            className="btn-secondary btn-sm flex items-center gap-1"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Module</span>
          </button>
          <Link
            to={`/teacher/classes/${classId}/content/new`}
            className="btn-primary btn-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </Link>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filter resources by title, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        <div className="card p-3 flex items-center justify-between">
          <span className="text-xs text-secondary font-medium">Total Resources</span>
          <span className="text-lg font-bold">{resources.length}</span>
        </div>

        <div className="card p-3 flex items-center justify-between">
          <span className="text-xs text-secondary font-medium">Published</span>
          <span className="text-lg font-bold text-success">
            {resources.filter((r) => r.status === 'published').length}
          </span>
        </div>
      </div>

      {/* Content Modules & Resource List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="spinner"></div>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-secondary mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold mb-1">No Resources Found</h3>
          <p className="text-sm text-secondary mb-4">
            Upload PDFs, add text notes, or save links to build your classroom knowledge base.
          </p>
          <Link to={`/teacher/classes/${classId}/content/new`} className="btn-primary">
            Upload First Resource
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResources.map((resource) => (
            <div
              key={resource._id}
              className="card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-lg bg-surface-hover text-primary font-bold">
                  {resource.resourceType === 'pdf' && <FileText className="w-5 h-5" />}
                  {resource.resourceType === 'text_note' && <BookOpen className="w-5 h-5" />}
                  {resource.resourceType === 'external_link' && <LinkIcon className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base">{resource.title}</h3>
                    <span
                      className={`badge text-xs font-semibold ${
                        resource.status === 'published'
                          ? 'badge-success'
                          : resource.status === 'ready'
                          ? 'badge-info'
                          : 'badge-warning'
                      }`}
                    >
                      {resource.status}
                    </span>
                    <span className="badge badge-secondary text-xs">{resource.indexingStatus}</span>
                  </div>

                  <p className="text-xs text-secondary mb-2 line-clamp-1">{resource.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-secondary">
                    <span>Topic: <strong>{resource.topic}</strong></span>
                    <span>Unit: <strong>{resource.unit}</strong></span>
                    <span>Chunks: <strong>{resource.totalChunks}</strong></span>
                    <span>Versions: <strong>v{resource.totalVersions}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => handlePublishToggle(resource)}
                  className={`btn-sm ${resource.status === 'published' ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {resource.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <Link to={`/teacher/resources/${resource._id}`} className="btn-secondary btn-sm flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Manage</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Module Modal */}
      {isModuleModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md">
            <h3 className="text-lg font-bold mb-4">Create Content Module</h3>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <label className="input-label">Module Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 1: Structural Fundamentals"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Description (Optional)</label>
                <textarea
                  placeholder="Brief summary of module learning objectives..."
                  value={newModuleDesc}
                  onChange={(e) => setNewModuleDesc(e.target.value)}
                  className="input-field min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModuleModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
