import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentResourceService } from '../../../services/contentResourceService.js';
import { resourceProgressService } from '../../../services/resourceProgressService.js';
import { bookmarkService } from '../../../services/bookmarkService.js';
import { revisionQueueService } from '../../../services/revisionQueueService.js';
import { resourceAIService } from '../../../services/resourceAIService.js';

import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  CheckCircle,
  Bookmark,
  PlusCircle,
  FileText,
  Clock,
  HelpCircle,
} from 'lucide-react';

export const StudentResourcePage = () => {
  const { resourceId } = useParams();
  const [resource, setResource] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [activeTab, setActiveTab] = useState('read');
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  const loadStudentResource = useCallback(async () => {
    setLoading(true);
    try {
      const [resRes, artRes] = await Promise.all([
        contentResourceService.getResourceDetails(resourceId),
        resourceAIService.getArtifacts(resourceId),
      ]);
      setResource(resRes?.data?.resource);
      setArtifacts(artRes?.data?.items || []);

      // Record student open activity
      await resourceProgressService.recordOpen(resourceId);
    } catch (err) {
      console.error('Error loading student resource:', err);
    } finally {
      setLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    loadStudentResource();
  }, [loadStudentResource]);

  const handleMarkCompleted = async () => {
    try {
      await resourceProgressService.markCompleted(resourceId);
      setCompleted(true);
    } catch (err) {
      console.error('Error marking completed:', err);
    }
  };

  const handleBookmark = async () => {
    try {
      await bookmarkService.addBookmark(resourceId);
      alert('Resource bookmarked!');
    } catch (err) {
      console.error('Error bookmarking:', err);
    }
  };

  if (loading || !resource) {
    return (
      <div className="flex justify-center p-12">
        <div className="spinner"></div>
      </div>
    );
  }

  const currentVersion = resource.currentVersionId;
  const summaryArtifact = artifacts.find((a) => a.artifactType === 'summary');
  const flashcardsArtifact = artifacts.find((a) => a.artifactType === 'flashcards');
  const questionsArtifact = artifacts.find((a) => a.artifactType === 'revision_questions');

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <Link to={`/student/classes/${resource.classroomId}/content`} className="btn-secondary btn-sm flex items-center gap-1 w-fit mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Class Resources</span>
      </Link>

      {/* Resource Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="badge badge-secondary text-xs uppercase mb-2 inline-block">{resource.resourceType}</span>
            <h1 className="text-2xl font-bold mb-1">{resource.title}</h1>
            <p className="text-sm text-secondary mb-3">{resource.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-secondary">
              <span>Topic: <strong>{resource.topic}</strong></span>
              <span>Unit: <strong>{resource.unit}</strong></span>
              <span>Est. Time: <strong>{resource.estimatedReadingMinutes} min</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleBookmark} className="btn-secondary btn-sm flex items-center gap-1">
              <Bookmark className="w-4 h-4" />
              <span>Bookmark</span>
            </button>
            <button
              onClick={handleMarkCompleted}
              disabled={completed}
              className={`btn-sm flex items-center gap-1 ${completed ? 'btn-secondary text-success' : 'btn-primary'}`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{completed ? 'Completed' : 'Mark Completed'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('read')}
          className={`px-4 py-2 font-medium text-sm border-b-2 flex items-center gap-2 ${
            activeTab === 'read' ? 'border-primary text-primary' : 'border-transparent text-secondary'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Read Document</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 font-medium text-sm border-b-2 flex items-center gap-2 ${
            activeTab === 'ai' ? 'border-primary text-primary' : 'border-transparent text-secondary'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Study Aids ({artifacts.length})</span>
        </button>
      </div>

      {/* Content Body */}
      {activeTab === 'read' && (
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Document Content</h3>
          {currentVersion?.textContent ? (
            <div className="bg-surface p-6 rounded-lg text-sm font-sans leading-relaxed whitespace-pre-wrap border border-border">
              {currentVersion.textContent}
            </div>
          ) : (
            <p className="text-sm text-secondary">No document preview available.</p>
          )}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          {summaryArtifact && (
            <div className="card p-6">
              <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>AI Summary</span>
              </h3>
              <div className="bg-surface p-4 rounded-lg text-sm whitespace-pre-wrap">
                {summaryArtifact.content}
              </div>
            </div>
          )}

          {flashcardsArtifact && (
            <div className="card p-6">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Study Flashcards</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {flashcardsArtifact.structuredContent?.cards?.map((card, idx) => (
                  <div key={idx} className="p-4 border rounded-lg bg-surface space-y-2">
                    <p className="text-xs font-bold text-primary">Q: {card.question}</p>
                    <p className="text-xs text-secondary">A: {card.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {questionsArtifact && (
            <div className="card p-6">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>Revision Questions</span>
              </h3>
              <div className="space-y-3">
                {questionsArtifact.structuredContent?.questions?.map((q, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-surface">
                    <p className="text-xs font-bold mb-1">{idx + 1}. {q.question}</p>
                    <p className="text-xs text-success font-medium">Answer: {q.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
