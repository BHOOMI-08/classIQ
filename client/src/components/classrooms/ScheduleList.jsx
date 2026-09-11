import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const ScheduleList = ({ schedules = [] }) => {
  if (!schedules || schedules.length === 0) {
    return (
      <div className="schedule-list-empty">
        <Calendar size={32} color="var(--accent-sage)" />
        <p>No lecture schedule has been published for this classroom yet.</p>
      </div>
    );
  }

  // Group schedules by day of week
  const grouped = {};
  DAY_ORDER.forEach((day) => {
    grouped[day] = [];
  });

  schedules.forEach((s) => {
    const d = s.dayOfWeek.toLowerCase();
    if (grouped[d]) {
      grouped[d].push(s);
    }
  });

  const todayName = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase();

  return (
    <div className="schedule-list-container">
      {DAY_ORDER.map((day) => {
        const slots = grouped[day];
        if (!slots || slots.length === 0) return null;
        const isToday = day === todayName;

        return (
          <div key={day} className={`schedule-day-group ${isToday ? 'today-highlight' : ''}`}>
            <div className="day-header">
              <span className="day-name">{day.toUpperCase()}</span>
              {isToday && <span className="today-badge">Today</span>}
            </div>

            <div className="day-slots-list">
              {slots.map((slot, i) => (
                <div key={i} className="schedule-slot-card">
                  <div className="time-info">
                    <Clock size={15} className="time-icon" />
                    <span><b>{slot.startTime}</b> - <b>{slot.endTime}</b></span>
                  </div>
                  {slot.roomNumber && (
                    <div className="room-info">
                      <MapPin size={14} /> Room: {slot.roomNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleList;
