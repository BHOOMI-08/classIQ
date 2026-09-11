import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resourceSearchService } from '../../../services/resourceSearchService.js';
import { Search, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

export const ContentSearchPage = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || !classId) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await resourceSearchService.hybridSearch(classId, { query });
      setResults(res?.data?.items || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
          <Sparkles className="w-6 h-6 text-primary" />
          <span>Semantic RAG & Hybrid Search</span>
        </h1>
        <p className="text-sm text-secondary">
          Ask questions or search conceptual topics across your classroom learning resources.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="card p-4 mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-3.5" />
          <input
            type="text"
            required
            placeholder="Search e.g. What is the fundamental formula for matrix multiplication?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-1">
          {loading ? <div className="spinner-sm"></div> : <Search className="w-4 h-4" />}
          <span>Search</span>
        </button>
      </form>

      {/* Search Results List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="spinner"></div>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-secondary">No semantic matches found for "{query}".</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((item, idx) => (
            <div key={idx} className="card p-5 border hover:border-primary/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-secondary text-xs uppercase">{item.resource?.resourceType}</span>
                <span className="text-xs font-bold text-primary">
                  Relevance: {(item.relevanceScore * 100).toFixed(0)}%
                </span>
              </div>

              <h3 className="font-bold text-lg mb-1">{item.resource?.title}</h3>
              <p className="text-xs text-secondary mb-3">{item.resource?.description}</p>

              {item.matchingExcerpt && (
                <div className="bg-surface p-3 rounded-lg text-xs font-mono mb-3 border border-border">
                  <span className="font-bold text-primary block mb-1">
                    Section: {item.matchingExcerpt.sectionTitle} (Page {item.matchingExcerpt.pageNumber})
                  </span>
                  <p className="line-clamp-3 text-secondary">{item.matchingExcerpt.text}</p>
                </div>
              )}

              <Link to={`/student/resources/${item.resource?._id}`} className="btn-primary btn-sm flex items-center gap-1 w-fit">
                <span>Study Resource</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
