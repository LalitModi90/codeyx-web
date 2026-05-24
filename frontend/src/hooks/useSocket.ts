import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@clerk/nextjs';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5005';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { userId } = useAuth(); // Clerk Auth

  useEffect(() => {
    // Only connect if user is logged in
    if (!userId) return;

    const socketInstance = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('🔗 Connected to Realtime Server');
      // Tell server which user room to join
      socketInstance.emit('join_user_room', userId);
    });

    socketInstance.on('SYNC_COMPLETE', (data) => {
      console.log('✅ Realtime Sync Complete:', data);
      // Here you would typically show a toast notification
      // and invalidate React Query cache to auto-refresh UI
    });

    socketInstance.on('SYNC_FAILED', (data) => {
      console.error('❌ Realtime Sync Failed:', data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  return socket;
};
