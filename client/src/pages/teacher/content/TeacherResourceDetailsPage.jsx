import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentResourceService } from '../../../services/contentResourceService.js';
import { resourceAIService } from '../../../services/resourceAIService.js';

import {
  ArrowLeft,
  FileText,
  Sparkles,
  Layers,
  Users,
  CheckCircle,
  RefreshCw,
  Upload,
  BookOpen,
  HelpCircle,
  Clock,
} from 'lucide-react';

export const TeacherResourceDetailsPage = () => {
  const { resourceId } = useParams();
  const [resource, setResource] = useState(null);
  const [versions, setVersions] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // File replacement state
  const [replaceFile, setReplaceFile] = useState(null);
  const [changeNote, setChangeNote] = useState('');
  const [replacing, setReplacing] = useState(false);

  // AI Generation state
  const [generatingAI, setGeneratingAI] = useState(false);

  const loadResourceData = useCallback(async () => {
    setLoading(true);
    try {
      const [resRes, verRes, artRes] = await Promise.all([
        contentResourceService.getResourceDetails(resourceId),
        contentResourceService.getVersions(resourceId),
        resourceAIService.getArtifacts(resourceId),
      ]);
      setResource(resRes?.data?.resource);
      setVersions(verRes?.data?.items || []);
      setArtifacts(artRes?.data?.items || []);
    } catch (err) {
      console.error('Error loading resource details:', err);
    } finally {
      setLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    loadResourceData();
  }, [loadResourceData]);

  const handleFileReplacement = async (e) => {
    e.preventDefault();
    if (!replaceFile) return;
    setReplacing(true);
    try {
      const formData = new FormData();
      formData.append('file', replaceFile);
      formData.append('changeNote', changeNote);
      await contentResourceService.replaceVersion(resourceId, formData);
      setReplaceFile(null);
      setChangeNote('');
      await loadResourceData();
    } catch (err) {
      console.error('Error replacing version:', err);
    } finally {
      setReplacing(false);
    }
  };

  const handleGenerateSummary = async () => {
    setGeneratingAI(true);
    try {
      await resourceAIService.generateSummary(resourceId);
      await loadResourceData();
    } catch (err) {
      console.error('Error generating summary:', err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setGeneratingAI(true);
    try {
      await resourceAIService.generateFlashcards(resourceId, 5);
      await loadResourceData();
    } catch (err) {
      console.error('Error generating flashcards:', err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setGeneratingAI(true);
    try {
      await resourceAIService.generateRevisionQuestions(resourceId, 5);
      await loadResourceData();
    } catch (err) {
      console.error('Error generating questions:', err);
    } finally {
      setGeneratingAI(false);
    }
  };

  if (loading || !resource) {
    return (
      <div className="flex justify-center p-12">
        <div className="spinner"></div>
      </div>
    );
  }

  const currentVersion = versions.find((v) => v.isCurrent) || versions[0];
  const summaryArtifact = artifacts.find((a) => a.artifactType === 'summary');
  const flashcardsArtifact = artifacts.find((a) => a.artifactType === 'flashcards');
  const questionsArtifact = artifacts.find((a) => a.artifactType === 'revision_questions');

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <Link to={`/teacher/classes/${resource.classroomId}/content`} className="btn-secondary btn-sm flex items-center gap-1 w-fit mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Class Content</span>
      </Link>

      {/* Header Banner */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{resource.title}</h1>
              <span className="badge badge-success text-xs font-bold">{resource.status}</span>
              <span className="badge badge-secondary text-xs">{resource.indexingStatus}</span>
            </div>
            <p className="text-sm text-secondary mb-2">{resource.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-secondary">
              <span>Topic: <strong>{resource.topic}</strong></span>
              <span>Unit: <strong>{resource.unit}</strong></span>
              <span>Chunks: <strong>{resource.totalChunks}</strong></span>
              <span>Est. Reading: <strong>{resource.estimatedReadingMinutes} min</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex border-b border-border mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-secondary'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'ai' ? 'border-primary text-primary' : 'border-transparent text-secondary'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Artifacts</span>
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`px-4 py-2 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'versions' ? 'border-primary text-primary' : 'border-transparent text-secondary'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Versions ({versions.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 card p-6">
            <h3 className="font-bold text-lg mb-3">Extracted Content Preview</h3>
            {currentVersion?.textContent ? (
              <div className="bg-surface p-4 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto border border-border">
                {currentVersion.textContent}
              </div>
            ) : (
              <p className="text-sm text-secondary">No raw text preview available.</p>
            )}
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-base">Resource Metadata</h3>
            <div className="text-xs space-y-2">
              <div className="flex justify-between border-b pb-1">
                <span className="text-secondary">Type</span>
                <span className="font-bold uppercase">{resource.resourceType}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-secondary">Current Version</span>
                <span className="font-bold">v{resource.totalVersions}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-secondary">Word Count</span>
                <span className="font-bold">{resource.wordCount}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-secondary">Character Count</span>
                <span className="font-bold">{resource.characterCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* AI Controls */}
          <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Generate AI Learning Content</span>
            </span>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleGenerateSummary}
                disabled={generatingAI}
                className="btn-primary btn-sm flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Summary</span>
              </button>
              <button
                onClick={handleGenerateFlashcards}
                disabled={generatingAI}
                className="btn-secondary btn-sm flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Flashcards</span>
              </button>
              <button
                onClick={handleGenerateQuestions}
                disabled={generatingAI}
                className="btn-secondary btn-sm flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Questions</span>
              </button>
            </div>
          </div>

          {/* Generated Artifacts */}
          {summaryArtifact && (
            <div className="card p-6">
              <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>AI Summary</span>
              </h3>
              <div className="bg-surface p-4 rounded-lg text-sm whitespace-pre-wrap font-sans">
                {summaryArtifact.content}
              </div>
            </div>
          )}

          {flashcardsArtifact && (
            <div className="card p-6">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Flashcards ({flashcardsArtifact.structuredContent?.cards?.length || 0})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {flashcardsArtifact.structuredContent?.cards?.map((card, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-surface space-y-2">
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

      {activeTab === 'versions' && (
        <div className="space-y-6">
          {/* Replace File Form */}
          <div className="card p-6">
            <h3 className="font-bold text-base mb-2">Replace File Version</h3>
            <form onSubmit={handleFileReplacement} className="space-y-4">
              <div>
                <input
                  type="file"
                  required
                  onChange={(e) => setReplaceFile(e.target.files[0])}
                  className="input-field"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Version change note (e.g. Updated chapter 4 formula derivations)..."
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={replacing} className="btn-primary btn-sm flex items-center gap-1">
                <Upload className="w-4 h-4" />
                <span>Upload New Version</span>
              </button>
            </form>
          </div>

          {/* Version List */}
          <div className="card p-6">
            <h3 className="font-bold text-base mb-4">Version History</h3>
            <div className="space-y-3">
              {versions.map((ver) => (
                <div key={ver._id} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">Version {ver.versionNumber}</span>
                      {ver.isCurrent && <span className="badge badge-success text-xs font-bold">Current</span>}
                    </div>
                    <p className="text-xs text-secondary">{ver.originalFileName} • {ver.changeNote}</p>
                  </div>
                  <span className="text-xs text-secondary">{new Date(ver.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
