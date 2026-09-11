import React, { useState } from 'react';
import { useGeolocation } from '../../../hooks/useGeolocation.js';
import { Shield, MapPin, Clock, X, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const StartAttendanceModal = ({ isOpen, onClose, onStart, classroomName }) => {
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [qrRotationSeconds, setQrRotationSeconds] = useState(15);
  const [locationRequired, setLocationRequired] = useState(false);
  const [geofenceRadiusMeters, setGeofenceRadiusMeters] = useState(100);
  const [lateAfterMinutes, setLateAfterMinutes] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [locationStatus, setLocationStatus] = useState(null); // 'DETECTING', 'DETECTED', 'ERROR'

  const { getCurrentLocation, loading: geoLoading, error: geoError } = useGeolocation();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      let teacherLocation = null;
      if (locationRequired) {
        setLocationStatus('DETECTING');
        try {
          teacherLocation = await getCurrentLocation();
          setLocationStatus('DETECTED');
        } catch (locErr) {
          setLocationStatus('ERROR');
          throw new Error(locErr.message || 'Geofence location permission is required to start geofenced attendance session');
        }
      }

      await onStart({
        durationMinutes: Number(durationMinutes),
        qrRotationSeconds: Number(qrRotationSeconds),
        locationRequired,
        teacherLocation,
        geofenceRadiusMeters: Number(geofenceRadiusMeters),
        lateAfterMinutes: Number(lateAfterMinutes),
      });

      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to start attendance session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="card w-full max-w-lg p-6 shadow-2xl bg-surface border border-border rounded-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Start Smart Attendance</h2>
              {classroomName && <p className="text-xs text-muted font-medium">{classroomName}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-variant transition-colors"
            title="Close modal"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="p-3 mb-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 flex items-center space-x-1">
              <Clock className="w-4 h-4 text-primary" />
              <span>Session Duration</span>
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="input-select w-full text-xs p-3 rounded-xl bg-surface-variant border border-border"
            >
              <option value="5">5 Minutes</option>
              <option value="10">10 Minutes (Default)</option>
              <option value="15">15 Minutes</option>
              <option value="20">20 Minutes</option>
              <option value="30">30 Minutes</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">QR Rotation Interval</label>
              <select
                value={qrRotationSeconds}
                onChange={(e) => setQrRotationSeconds(e.target.value)}
                className="input-select w-full text-xs p-3 rounded-xl bg-surface-variant border border-border"
              >
                <option value="10">10 Seconds (Strict Security)</option>
                <option value="15">15 Seconds (Standard)</option>
                <option value="30">30 Seconds</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">Late Threshold (Mins)</label>
              <input
                type="number"
                min="0"
                max={durationMinutes}
                value={lateAfterMinutes}
                onChange={(e) => setLateAfterMinutes(e.target.value)}
                className="input-field w-full text-xs p-3 rounded-xl bg-surface-variant border border-border"
              />
            </div>
          </div>

          {/* Geofence Toggle */}
          <div className="p-4 border border-border rounded-xl bg-surface-variant/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-bold text-xs">Require Geofence Verification</div>
                  <div className="text-[11px] text-muted">Students must be within physical radius</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={locationRequired}
                  onChange={(e) => {
                    setLocationRequired(e.target.checked);
                    if (!e.target.checked) setLocationStatus(null);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Geofence Status Indicators */}
            {locationRequired && (
              <div className="pt-2 border-t border-border/50 space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Geofence Radius</label>
                  <select
                    value={geofenceRadiusMeters}
                    onChange={(e) => setGeofenceRadiusMeters(e.target.value)}
                    className="input-select w-full text-xs p-2.5 rounded-lg bg-surface border border-border"
                  >
                    <option value="50">50 Meters (Strict Classroom)</option>
                    <option value="100">100 Meters (Standard Hall)</option>
                    <option value="200">200 Meters (Campus Building)</option>
                  </select>
                </div>

                <div className="text-xs">
                  {locationStatus === 'DETECTING' || geoLoading ? (
                    <div className="flex items-center space-x-2 text-primary font-semibold">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Detecting teacher GPS location...</span>
                    </div>
                  ) : locationStatus === 'DETECTED' ? (
                    <div className="flex items-center space-x-2 text-success font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Location detected & locked</span>
                    </div>
                  ) : geoError || locationStatus === 'ERROR' ? (
                    <div className="flex items-center space-x-2 text-danger font-semibold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{geoError || 'Location permission denied'}</span>
                    </div>
                  ) : (
                    <div className="text-muted text-[11px]">
                      GPS location will be requested upon starting session
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary btn-sm"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary btn-sm flex items-center space-x-2"
              disabled={submitting || geoLoading}
            >
              {submitting || geoLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Acquiring Location...</span>
                </>
              ) : (
                <span>Start Session</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
