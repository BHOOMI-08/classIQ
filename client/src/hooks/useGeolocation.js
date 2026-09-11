import { useState, useCallback } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errMsg = 'Geolocation is not supported by your browser';
        setError(errMsg);
        reject(new Error(errMsg));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: position.coords.accuracy,
            capturedAt: new Date(position.timestamp).toISOString(),
          };
          setLocation(locData);
          setLoading(false);
          resolve(locData);
        },
        (geoErr) => {
          let errMsg = 'Failed to acquire location';
          if (geoErr.code === 1) errMsg = 'Location permission denied';
          else if (geoErr.code === 2) errMsg = 'Location position unavailable';
          else if (geoErr.code === 3) errMsg = 'Location acquisition timed out';
          setError(errMsg);
          setLoading(false);
          reject(new Error(errMsg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  return { location, loading, error, getCurrentLocation };
};
