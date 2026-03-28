import io, { Socket } from 'socket.io-client';

interface SocketMessage {
  type: string;
  title: string;
  message: string;
  [key: string]: any;
}

interface NotificationListener {
  (data: SocketMessage): void;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<NotificationListener>> = new Map();
  private static instance: SocketService;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /**
   * Initialize and connect to Socket.IO server
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      try {
        const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';

        this.socket = io(serverUrl, {
          auth: {
            token: `Bearer ${token}`,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
          console.log('✓ Socket connected:', this.socket?.id);
          resolve();
          this.setupListeners();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          reject(error);
        });

        this.socket.on('disconnect', () => {
          console.log('✗ Socket disconnected');
        });
      } catch (error) {
        console.error('Socket initialization error:', error);
        reject(error);
      }
    });
  }

  /**
   * Set up all event listeners for notifications
   */
  private setupListeners() {
    if (!this.socket) return;

    const events = [
      'trip:payment-marked',
      'trip:payment-confirmed',
      'trip:user-invited',
      'trip:member-joined',
      'trip:invite-rejected',
      'trip:expense-created',
      'trip:reminder',
    ];

    events.forEach(event => {
      this.socket!.on(event, (data: SocketMessage) => {
        console.log(`📢 ${event}:`, data);
        this.emitToListeners(event, data);
      });
    });

    console.log('✓ Socket listeners configured');
  }

  /**
   * Register listener for specific event
   */
  on(event: string, callback: NotificationListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Unregister listener
   */
  off(event: string, callback: NotificationListener) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  /**
   * Emit to registered listeners
   */
  private emitToListeners(event: string, data: SocketMessage) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Join trip room
   */
  joinTrip(tripId: string) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot join trip');
      return;
    }
    console.log(`🚀 Joining trip room: ${tripId}`);
    this.socket.emit('join:trip', tripId);
  }

  /**
   * Leave trip room
   */
  leaveTrip(tripId: string) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot leave trip');
      return;
    }
    console.log(`✓ Leaving trip room: ${tripId}`);
    this.socket.emit('leave:trip', tripId);
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('✗ Socket manually disconnected');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = SocketService.getInstance();

