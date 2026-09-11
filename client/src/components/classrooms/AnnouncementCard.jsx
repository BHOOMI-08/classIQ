import React from 'react';
import { AlertCircle, Clock, CheckCircle2, Archive, Edit, Send } from 'lucide-react';

export const AnnouncementCard = ({
  announcement,
  isTeacher = false,
  onPublish,
  onArchive,
  onEdit,
}) => {
  const isDraft = announcement.status === 'draft';

  return (
    <div className={`announcement-card priority-${announcement.priority}`}>
      <div className="announcement-card-header">
        <div className="title-row">
          <span className={`priority-badge ${announcement.priority}`}>
            {announcement.priority.toUpperCase()}
          </span>
          <h4 className="announcement-title">{announcement.title}</h4>
        </div>

        {isTeacher && (
          <div className="announcement-actions">
            {isDraft && onPublish && (
              <button onClick={() => onPublish(announcement)} className="btn-icon-action success" title="Publish">
                <Send size={14} /> Publish
              </button>
            )}
            {onArchive && (
              <button onClick={() => onArchive(announcement)} className="btn-icon-action danger" title="Archive">
                <Archive size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="announcement-card-body">
        <p>{announcement.message}</p>
      </div>

      <div className="announcement-card-footer">
        <div className="meta-left">
          <span>By <b>{announcement.teacherId?.name || 'Faculty Member'}</b></span>
          <span className="dot-sep">•</span>
          <span className="time-text">
            <Clock size={12} /> {new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString()}
          </span>
          {announcement.editedAt && <span className="edited-tag">(Edited)</span>}
        </div>

        {isDraft && <span className="status-tag draft">Draft</span>}
      </div>
    </div>
  );
};

export default AnnouncementCard;
