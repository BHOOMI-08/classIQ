import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { revisionQueueService } from '../../../services/revisionQueueService.js';
import { Clock, Trash2, ArrowRight, CheckCircle } from 'lucide-react';

export const RevisionQueuePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await revisionQueueService.getRevisionQueue();
      setItems(res?.data?.items || []);
    } catch (err) {
      console.error('Error loading revision queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleRemove = async (resourceId) => {
    try {
      await revisionQueueService.removeFromQueue(resourceId);
      await loadQueue();
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
          <Clock className="w-6 h-6 text-primary" />
          <span>My Revision Queue</span>
        </h1>
        <p className="text-sm text-secondary">Organized study queue for upcoming exam preparation.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="spinner"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="w-12 h-12 text-secondary mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold mb-1">Revision Queue Empty</h3>
          <p className="text-sm text-secondary">Add resources to your revision queue while studying.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="card p-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base">{item.resourceId?.title}</h3>
                  <span className="badge badge-warning text-xs font-bold uppercase">{item.priority}</span>
                </div>
                <p className="text-xs text-secondary">{item.reason}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRemove(item.resourceId?._id)}
                  className="btn-danger btn-sm p-2"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link to={`/student/resources/${item.resourceId?._id}`} className="btn-primary btn-sm flex items-center gap-1">
                  <span>Revise</span>
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
