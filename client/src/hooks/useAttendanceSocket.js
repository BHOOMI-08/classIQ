import { useEffect, useState } from 'react';
import { getSocket } from '../socket/socketClient.js';
import { subscribeTeacherAttendance, unsubscribeTeacherAttendance, subscribeStudentAttendance, unsubscribeStudentAttendance } from '../socket/attendanceSocket.js';

export const useTeacherAttendanceSocket = (sessionId, classroomId) => {
  const [qrData, setQrData] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!sessionId || !classroomId) return;

    subscribeTeacherAttendance({ sessionId, classroomId });
    const socket = getSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onQrRotated = (data) => {
      if (data.sessionId === sessionId) {
        setQrData(data);
      }
    };

    const onAttendanceJoined = (data) => {
      if (data.sessionId === sessionId) {
        setLiveEvents((prev) => [data, ...prev]);
      }
    };

    const onAttendanceSessionEnded = () => {
      setQrData(null);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('attendance:qr-rotated', onQrRotated);
    socket.on('attendance:joined', onAttendanceJoined);
    socket.on('attendance:session-ended', onAttendanceSessionEnded);

    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('attendance:qr-rotated', onQrRotated);
      socket.off('attendance:joined', onAttendanceJoined);
      socket.off('attendance:session-ended', onAttendanceSessionEnded);
      unsubscribeTeacherAttendance({ sessionId });
    };
  }, [sessionId, classroomId]);

  return { qrData, liveEvents, isConnected };
};

export const useStudentAttendanceSocket = (sessionId, classroomId) => {
  const [statusUpdate, setStatusUpdate] = useState(null);

  useEffect(() => {
    if (!sessionId || !classroomId) return;

    subscribeStudentAttendance({ sessionId, classroomId });
    const socket = getSocket();

    const onStatusUpdate = (data) => {
      if (data.sessionId === sessionId) {
        setStatusUpdate(data);
      }
    };

    socket.on('attendance:status-update', onStatusUpdate);

    return () => {
      socket.off('attendance:status-update', onStatusUpdate);
      unsubscribeStudentAttendance({ sessionId });
    };
  }, [sessionId, classroomId]);

  return { statusUpdate };
};
