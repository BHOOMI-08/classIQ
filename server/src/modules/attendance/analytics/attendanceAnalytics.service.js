import { StudentHealthService } from './studentHealth.service.js';
import { ClassroomAnalyticsService } from './classroomAnalytics.service.js';
import { StudentInsightService } from './studentInsight.service.js';
import { AttendanceSecurityAnalyticsService } from './attendanceSecurityAnalytics.service.js';

export class AttendanceAnalyticsService {
  static getStudentClassHealth = StudentHealthService.getStudentClassHealth.bind(StudentHealthService);
  static getStudentOverallHealth = StudentHealthService.getStudentOverallHealth.bind(StudentHealthService);

  static getClassroomOverview = ClassroomAnalyticsService.getClassroomOverview.bind(ClassroomAnalyticsService);
  static getClassroomTrends = ClassroomAnalyticsService.getClassroomTrends.bind(ClassroomAnalyticsService);
  static getSessionAnalyticsList = ClassroomAnalyticsService.getSessionAnalyticsList.bind(ClassroomAnalyticsService);

  static getStudentInsight = StudentInsightService.getStudentInsight.bind(StudentInsightService);
  static getSecurityAnalytics = AttendanceSecurityAnalyticsService.getSecurityAnalytics.bind(AttendanceSecurityAnalyticsService);
}
