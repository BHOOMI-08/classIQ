import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env.js';
import { authenticateSocket } from './socket.auth.js';
import { registerAttendanceSocketHandlers } from '../modules/attendance/attendance.socket.js';
import { registerEngagementSocketHandlers } from '../modules/engagement/engagement.socket.js';
import { logger } from '../utils/logger.js';

let ioInstance = null;

export const initSocketServer = (httpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    transports: ['websocket', 'polling'],
  });

  // Socket Authentication Middleware
  io.use(authenticateSocket);

  // Register domain socket handlers
  registerAttendanceSocketHandlers(io);
  registerEngagementSocketHandlers(io);

  ioInstance = io;
  logger.info('⚡ Socket.IO server initialized successfully');
  return io;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO instance has not been initialized');
  }
  return ioInstance;
};
