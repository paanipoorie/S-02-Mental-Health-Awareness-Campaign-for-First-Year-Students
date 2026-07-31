import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from './auth';

const SOCKET_URL = import.meta.env.PUBLIC_API_URL
  ? import.meta.env.PUBLIC_API_URL.replace('/api', '')
  : 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  const token = getAccessToken();
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  } else {
    if (socket.auth && (socket.auth as any).token !== token) {
      (socket.auth as any).token = token;
      if (socket.connected) {
        socket.disconnect().connect();
      }
    }
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}
