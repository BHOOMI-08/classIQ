import { ATTENDANCE_CONFIG } from '../config/attendance.config.js';

export class GeolocationService {
  /**
   * Earth's mean radius in meters.
   */
  static EARTH_RADIUS_METERS = 6371000;

  /**
   * Validate latitude (-90 to 90) and longitude (-180 to 180).
   */
  static isValidCoordinate(lat, lon) {
    if (typeof lat !== 'number' || typeof lon !== 'number') return false;
    if (isNaN(lat) || isNaN(lon)) return false;
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }

  /**
   * Calculate exact distance between two geographical points using the Haversine formula.
   * Inputs accept numbers: lat1, lon1, lat2, lon2.
   * Returns distance in meters (rounded to 2 decimal places).
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    if (!this.isValidCoordinate(lat1, lon1) || !this.isValidCoordinate(lat2, lon2)) {
      throw new Error('Invalid coordinates supplied to Haversine calculation');
    }

    const toRad = (angle) => (angle * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const rLat1 = toRad(lat1);
    const rLat2 = toRad(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = this.EARTH_RADIUS_METERS * c;
    return Math.round(distance * 100) / 100;
  }

  /**
   * Evaluate geofence compliance taking student GPS accuracy into account.
   * GeoJSON coordinate format: [longitude, latitude]
   */
  static evaluateGeofence({ teacherCoords, studentCoords, accuracyMeters = 0, allowedRadiusMeters }) {
    // GeoJSON order is [longitude, latitude]
    const teacherLon = teacherCoords[0];
    const teacherLat = teacherCoords[1];
    const studentLon = studentCoords[0];
    const studentLat = studentCoords[1];

    if (!this.isValidCoordinate(teacherLat, teacherLon) || !this.isValidCoordinate(studentLat, studentLon)) {
      return {
        valid: false,
        reason: 'INVALID_COORDINATES',
        distanceMeters: null,
        insideGeofence: false,
        accuracyAcceptable: false,
      };
    }

    const distanceMeters = this.calculateDistance(teacherLat, teacherLon, studentLat, studentLon);
    const maxAccuracy = ATTENDANCE_CONFIG.MAX_GPS_ACCURACY_METERS;
    const accuracyAcceptable = accuracyMeters >= 0 && accuracyMeters <= maxAccuracy;

    // Effective distance calculation considering uncertainty margin
    const minPossibleDistance = Math.max(0, distanceMeters - accuracyMeters);
    const insideGeofence = distanceMeters <= allowedRadiusMeters;
    const possiblyInsideGeofence = minPossibleDistance <= allowedRadiusMeters;

    return {
      valid: true,
      distanceMeters,
      allowedRadiusMeters,
      insideGeofence,
      possiblyInsideGeofence,
      accuracyMeters,
      accuracyAcceptable,
      effectiveDistanceMeters: Math.round(minPossibleDistance * 100) / 100,
    };
  }
}
