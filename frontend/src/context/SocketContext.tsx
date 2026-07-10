import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config';

interface SocketNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: Date;
}

interface SocketContextType {
  socket: Socket | null;
  notifications: SocketNotification[];
  clearNotification: (id: string) => void;
  addManualNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL);
    setSocket(socketInstance);

    socketInstance.on('new_attendance', (data: any) => {
      setNotifications(prev => [
        {
          id: Math.random().toString(),
          title: 'Attendance Marked',
          message: `${data.studentName} (${data.usn}) was marked ${data.status} (Conf: ${data.confidence}%)`,
          type: 'success',
          timestamp: new Date()
        },
        ...prev
      ]);
    });

    socketInstance.on('unknown_face_alert', (data: any) => {
      setNotifications(prev => [
        {
          id: data.id || Math.random().toString(),
          title: '⚠️ Unknown Face Detected',
          message: `Unrecognized face spotted in ${data.location || 'Classroom'} (Conf: ${data.confidence}%)`,
          type: 'alert',
          timestamp: new Date()
        },
        ...prev
      ]);
    });

    socketInstance.on('session_status', (data: any) => {
      setNotifications(prev => [
        {
          id: Math.random().toString(),
          title: 'Session Notice',
          message: `Attendance session was ${data.status} for ${data.timetable?.subject?.name || 'class'}`,
          type: 'info',
          timestamp: new Date()
        },
        ...prev
      ]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addManualNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert') => {
    setNotifications(prev => [
      {
        id: Math.random().toString(),
        title,
        message,
        type,
        timestamp: new Date()
      },
      ...prev
    ]);
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, clearNotification, addManualNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
