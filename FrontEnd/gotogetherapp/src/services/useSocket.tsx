import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

interface SocketProviderProps {
  children: ReactNode;
  token: string | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children, token }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Use same server as API
    const socketServerUrl = 'http://192.168.2.46:3000';

    console.log('🔌 Socket connecting to:', socketServerUrl);

    const socketInstance = io(socketServerUrl, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      path: '/socket.io/',
      forceNew: true,
    });

    socketInstance.on('connect', () => {
      console.log('✓ Socket connected:', socketInstance.id);
      setIsConnected(true);

      // Verify user received socket connection by checking rooms
      console.log('📡 Socket rooms after connect:', Object.keys(socketInstance.rooms || {}));
    });

    socketInstance.on('disconnect', reason => {
      console.log('✗ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error: any) => {
      console.error('⚠️ Socket connection error:', error);
      console.error('   Error message:', error.message);
      console.error('   Error type:', error.type);
      console.error('   Error data:', error.data);
      if (error.data?.content) {
        console.error('   Error content:', error.data.content);
      }
      console.warn('ℹ️ Attempting fallback to polling transport...');
    });

    socketInstance.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  const value = useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
