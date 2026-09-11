import React, { useState } from 'react';
import { Send, AlertCircle, Sparkles } from 'lucide-react';

export const AnnouncementComposer = ({ onPublish, onSaveDraft }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e, status = 'published') => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setLoading(true);
    try {
      if (status === 'published' && onPublish) {
        await onPublish({ title, message, priority, status: 'published' });
      } else if (onSaveDraft) {
        await onSaveDraft({ title, message, priority, status: 'draft' });
      }
      setTitle('');
      setMessage('');
      setPriority('normal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="announcement-composer-card">
      <div className="composer-header">
        <h4>Create Announcement</h4>
        <span className="composer-subtitle">Post important notices, lecture updates, or study guidelines</span>
      </div>

      <form onSubmit={(e) => handleSubmit(e, 'published')}>
        <div className="input-group">
          <label>Announcement Title</label>
          <input
            type="text"
            placeholder="e.g. Midterm Exam Syllabus & Schedule"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-control"
            required
          />
        </div>

        <div className="input-group">
          <label>Message Content</label>
          <textarea
            placeholder="Write announcement details here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-control textarea-control"
            rows={4}
            required
          />
        </div>

        <div className="composer-footer-row">
          <div className="priority-selector">
            <label>Priority Level:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input-control select-control-sm"
            >
              <option value="normal">Normal Priority</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="composer-button-group">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              className="btn btn-secondary btn-sm"
              disabled={loading}
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              <Send size={14} /> Publish Announcement
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AnnouncementComposer;
