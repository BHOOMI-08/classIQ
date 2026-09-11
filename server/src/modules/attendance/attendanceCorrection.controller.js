import { AttendanceCorrectionService } from './attendanceCorrection.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export class AttendanceCorrectionController {
  static correctRecord = async (req, res, next) => {
    try {
      const { recordId } = req.params;
      const result = await AttendanceCorrectionService.correctRecord(
        recordId,
        req.user,
        req.body,
        req.ip,
        req.headers['user-agent']
      );
      return ApiResponse.success(res, 200, 'Attendance record updated successfully', result);
    } catch (err) {
      next(err);
    }
  };

  static getCorrectionHistory = async (req, res, next) => {
    try {
      const { recordId } = req.params;
      const history = await AttendanceCorrectionService.getCorrectionHistory(recordId);
      return ApiResponse.success(res, 200, 'Correction history retrieved', { history });
    } catch (err) {
      next(err);
    }
  };
}
