import React from 'react';
import { MapPin } from 'lucide-react';

export const LocationPermissionState = ({ onRequestLocation }) => {
  return (
    <div className="card p-8 text-center max-w-sm mx-auto my-6 flex flex-col items-center">
      <MapPin className="w-16 h-16 text-primary mb-4 animate-pulse" />
      <h3 className="text-xl font-bold mb-2">Location Required</h3>
      <p className="text-muted text-sm mb-6">
        This classroom session requires location verification to confirm presence within the classroom geofence.
      </p>
      <button onClick={onRequestLocation} className="btn-primary w-full">
        Acquire & Submit Location
      </button>
    </div>
  );
};
