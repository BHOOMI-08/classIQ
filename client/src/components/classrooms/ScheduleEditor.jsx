import React, { useState } from 'react';
import { Plus, Trash2, Clock, MapPin, Calendar, Check } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const ScheduleEditor = ({ schedules = [], onChange }) => {
  const [items, setItems] = useState(schedules);

  const handleAddRow = () => {
    const newItems = [
      ...items,
      { dayOfWeek: 'monday', startTime: '09:00', endTime: '10:00', roomNumber: '' },
    ];
    setItems(newItems);
    onChange(newItems);
  };

  const handleRemoveRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="schedule-editor-wrapper">
      <div className="schedule-editor-header">
        <h4><Calendar size={18} /> Weekly Lecture Schedule</h4>
        <button type="button" onClick={handleAddRow} className="btn btn-secondary btn-sm">
          <Plus size={14} /> Add Lecture Slot
        </button>
      </div>

      {items.length === 0 ? (
        <div className="schedule-editor-empty">
          <p>No lecture slots configured yet. Click "Add Lecture Slot" to add class timing.</p>
        </div>
      ) : (
        <div className="schedule-rows-container">
          {items.map((item, index) => (
            <div key={index} className="schedule-row-item">
              <div className="input-field-col">
                <label>Day</label>
                <select
                  value={item.dayOfWeek}
                  onChange={(e) => handleItemChange(index, 'dayOfWeek', e.target.value)}
                  className="input-control select-control"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-field-col">
                <label>Start Time</label>
                <input
                  type="time"
                  value={item.startTime}
                  onChange={(e) => handleItemChange(index, 'startTime', e.target.value)}
                  className="input-control"
                  required
                />
              </div>

              <div className="input-field-col">
                <label>End Time</label>
                <input
                  type="time"
                  value={item.endTime}
                  onChange={(e) => handleItemChange(index, 'endTime', e.target.value)}
                  className="input-control"
                  required
                />
              </div>

              <div className="input-field-col flex-1">
                <label>Room Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Lab 302"
                  value={item.roomNumber || ''}
                  onChange={(e) => handleItemChange(index, 'roomNumber', e.target.value)}
                  className="input-control"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemoveRow(index)}
                className="btn-icon-danger"
                title="Remove slot"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleEditor;
