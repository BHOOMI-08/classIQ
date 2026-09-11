import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentResourceService } from '../../../services/contentResourceService.js';
import { bookmarkService } from '../../../services/bookmarkService.js';
import { revisionQueueService } from '../../../services/revisionQueueService.js';

import {
  BookOpen,
  FileText,
  Bookmark,
  Clock,
  Search,
  CheckCircle,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

export const StudentContentPage = () => {
  const { classId } = useParams();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadStudentContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contentResourceService.getResources(classId);
      setResources(res?.data?.items || []);
    } catch (err) {
      console.error('Error loading student content:', err);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadStudentContent();
  }, [loadStudentContent]);

  const handleBookmark = async (resourceId) => {
    try {
      await bookmarkService.addBookmark(resourceId);
      alert('Bookmarked resource successfully!');
    } catch (err) {
      console.error('Error bookmarking:', err);
    }
  };

  const handleAddRevision = async (resourceId) => {
    try {
      await revisionQueueService.addToQueue(resourceId, { priority: 'medium', reason: 'Exam revision' });
      alert('Added to revision queue!');
    } catch (err) {
      console.error('Error adding revision:', err);
    }
  };

  const filteredResources = resources.filter((res) =>
    res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span>Class Learning Resources</span>
          </h1>
          <p className="text-sm text-secondary">
            Access course materials, read text notes, view AI summaries, and build your study queue.
          </p>
        </div>

        <Link to={`/student/content/search?classId=${classId}`} className="btn-primary btn-sm flex items-center gap-1">
          <Search className="w-4 h-4" />
          <span>Semantic RAG Search</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 relative">
        <Search className="w-4 h-4 text-secondary absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search published notes, topics, units..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {/* Content List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="spinner"></div>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-secondary mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold mb-1">No Published Resources Yet</h3>
          <p className="text-sm text-secondary">Your teacher will publish learning resources here soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div key={res._id} className="card p-5 flex flex-col justify-between hover:border-primary/50 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="badge badge-secondary text-xs font-semibold uppercase">{res.resourceType}</span>
                  <span className="text-xs text-secondary flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{res.estimatedReadingMinutes} min</span>
                  </span>
                </div>

                <h3 className="font-bold text-base mb-1 line-clamp-1">{res.title}</h3>
                <p className="text-xs text-secondary mb-4 line-clamp-2">{res.description}</p>

                <div className="flex flex-wrap gap-2 text-xs text-secondary mb-4">
                  <span className="bg-surface px-2 py-1 rounded">Topic: {res.topic}</span>
                  <span className="bg-surface px-2 py-1 rounded">Unit: {res.unit}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleBookmark(res._id)}
                    title="Bookmark"
                    className="p-1.5 hover:bg-surface rounded text-secondary hover:text-primary transition-colors"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAddRevision(res._id)}
                    title="Add to Revision Queue"
                    className="p-1.5 hover:bg-surface rounded text-secondary hover:text-primary transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>

                <Link to={`/student/resources/${res._id}`} className="btn-primary btn-sm">
                  Study Resource
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
