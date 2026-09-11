import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, LogIn } from 'lucide-react';

export const EmptyClassroomState = ({
  isTeacher = false,
  title,
  message,
  actionText,
  actionLink,
}) => {
  return (
    <div className="empty-classroom-state">
      <div className="empty-icon-circle">
        <BookOpen size={40} color="var(--primary)" />
      </div>
      <h3>{title || (isTeacher ? 'No Classrooms Created Yet' : 'No Enrolled Classrooms')}</h3>
      <p>
        {message ||
          (isTeacher
            ? 'Create your first classroom to begin managing attendance, schedules, and learning materials.'
            : 'Enter a 6-character class code provided by your teacher to join a classroom.')}
      </p>

      {actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {isTeacher ? <Plus size={16} /> : <LogIn size={16} />}
          {actionText || (isTeacher ? 'Create Classroom' : 'Join Classroom')}
        </Link>
      )}
    </div>
  );
};

export default EmptyClassroomState;
