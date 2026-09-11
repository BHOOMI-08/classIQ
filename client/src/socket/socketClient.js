import { io } from 'socket.io-client';
import { getAccessToken } from '../services/api.js';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const token = getAccessToken();

    socket = io(socketUrl, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: {
        token: token ? `Bearer ${token}` : '',
      },
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  const token = getAccessToken();
  if (token) {
    s.auth = { token: `Bearer ${token}` };
  }
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
