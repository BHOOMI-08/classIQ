class MetricsCollector {
  constructor() {
    this.httpRequestsTotal = new Map();
    this.attendanceSubmissionsTotal = new Map();
    this.activeSocketConnections = 0;
    this.startTime = Date.now();
  }

  incHttpRequest(method, route, statusCode) {
    const key = `${method}:${route}:${statusCode}`;
    const current = this.httpRequestsTotal.get(key) || 0;
    this.httpRequestsTotal.set(key, current + 1);
  }

  incAttendanceSubmission(result) {
    const current = this.attendanceSubmissionsTotal.get(result) || 0;
    this.attendanceSubmissionsTotal.set(result, current + 1);
  }

  setSocketConnections(count) {
    this.activeSocketConnections = count;
  }

  getMetricsPrometheusFormat() {
    const lines = [
      '# HELP http_requests_total Total number of HTTP requests',
      '# TYPE http_requests_total counter',
    ];

    for (const [key, count] of this.httpRequestsTotal.entries()) {
      const [method, route, statusCode] = key.split(':');
      lines.push(`http_requests_total{method="${method}",route="${route}",status="${statusCode}"} ${count}`);
    }

    lines.push('# HELP attendance_submissions_total Total attendance submission outcomes');
    lines.push('# TYPE attendance_submissions_total counter');
    for (const [result, count] of this.attendanceSubmissionsTotal.entries()) {
      lines.push(`attendance_submissions_total{result="${result}"} ${count}`);
    }

    lines.push('# HELP active_socket_connections Active Socket.IO connections');
    lines.push('# TYPE active_socket_connections gauge');
    lines.push(`active_socket_connections ${this.activeSocketConnections}`);

    lines.push('# HELP process_uptime_seconds Process uptime in seconds');
    lines.push('# TYPE process_uptime_seconds gauge');
    lines.push(`process_uptime_seconds ${Math.floor((Date.now() - this.startTime) / 1000)}`);

    return lines.join('\n') + '\n';
  }
}

export const metricsCollector = new MetricsCollector();
