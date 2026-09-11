import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookmarkService } from '../../../services/bookmarkService.js';
import { Bookmark, Trash2, ArrowRight } from 'lucide-react';

export const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const res = await bookmarkService.getBookmarks();
      setBookmarks(res?.data?.items || []);
    } catch (err) {
      console.error('Error loading bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleRemove = async (resourceId) => {
    try {
      await bookmarkService.removeBookmark(resourceId);
      await loadBookmarks();
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
          <Bookmark className="w-6 h-6 text-primary" />
          <span>My Bookmarked Resources</span>
        </h1>
        <p className="text-sm text-secondary">Quick access to saved learning materials and notes.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="spinner"></div>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="card p-12 text-center">
          <Bookmark className="w-12 h-12 text-secondary mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold mb-1">No Bookmarks Saved</h3>
          <p className="text-sm text-secondary">Bookmark resources while studying for quick access.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bm) => (
            <div key={bm._id} className="card p-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base">{bm.resourceId?.title}</h3>
                <div className="flex items-center gap-2 text-xs text-secondary mt-1">
                  <span className="badge badge-secondary text-xs uppercase">{bm.resourceId?.resourceType}</span>
                  <span>Topic: {bm.resourceId?.topic}</span>
                  <span>Unit: {bm.resourceId?.unit}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRemove(bm.resourceId?._id)}
                  className="btn-danger btn-sm p-2"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link to={`/student/resources/${bm.resourceId?._id}`} className="btn-primary btn-sm flex items-center gap-1">
                  <span>Open</span>
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
