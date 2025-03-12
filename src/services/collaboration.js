import { nanoid } from 'nanoid';
import { io } from 'socket.io-client';

class CollaborationService {
  constructor() {
    this.socket = null;
    this.sessionId = null;
    this.callbacks = {
      onCodeUpdate: null,
      onCursorMove: null,
      onUserJoin: null,
      onUserLeave: null,
      onSessionUsers: null,
      onError: null,
      onConnectionChange: null,
    };
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
  }

  connect() {
    if (this.isConnected) {
      console.log('Already connected');
      return;
    }

    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      const error = 'Maximum connection attempts reached';
      console.error(error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
      return;
    }

    try {
      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io('http://localhost:3001', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      this.setupListeners();
      this.connectionAttempts++;
      console.log('Attempting to connect to server... Attempt:', this.connectionAttempts);
    } catch (error) {
      console.error('Failed to connect:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError('Failed to connect to server');
      }
    }
  }

  setupListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.connectionAttempts = 0;
      
      if (this.callbacks.onConnectionChange) {
        this.callbacks.onConnectionChange(true);
      }
      
      // Rejoin session if we were in one
      if (this.sessionId) {
        this.joinSession(this.sessionId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.isConnected = false;
      
      if (this.callbacks.onConnectionChange) {
        this.callbacks.onConnectionChange(false);
      }

      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        this.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
      
      if (this.callbacks.onConnectionChange) {
        this.callbacks.onConnectionChange(false);
      }
      
      if (this.callbacks.onError) {
        this.callbacks.onError('Failed to connect to server: ' + error.message);
      }
    });

    // Session events
    this.socket.on('code-update', (data) => {
      console.log('Received code update:', data);
      if (this.callbacks.onCodeUpdate) {
        this.callbacks.onCodeUpdate(data);
      }
    });

    this.socket.on('cursor-move', (data) => {
      if (this.callbacks.onCursorMove) {
        this.callbacks.onCursorMove(data);
      }
    });

    this.socket.on('user-joined', (data) => {
      console.log('User joined:', data);
      if (this.callbacks.onUserJoin) {
        this.callbacks.onUserJoin(data);
      }
    });

    this.socket.on('user-left', (userId) => {
      console.log('User left:', userId);
      if (this.callbacks.onUserLeave) {
        this.callbacks.onUserLeave(userId);
      }
    });

    this.socket.on('session-users', (users) => {
      console.log('Session users:', users);
      if (this.callbacks.onSessionUsers) {
        this.callbacks.onSessionUsers(users);
      }
    });

    this.socket.on('error', (error) => {
      console.error('Server error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    });
  }

  createSession() {
    if (!this.isConnected) {
      console.error('Not connected to server');
      return null;
    }

    this.sessionId = nanoid();
    console.log('Creating session:', this.sessionId);
    this.socket.emit('join-session', this.sessionId);
    return this.sessionId;
  }

  joinSession(sessionId) {
    if (!this.isConnected) {
      console.error('Not connected to server');
      return;
    }

    console.log('Joining session:', sessionId);
    this.sessionId = sessionId;
    this.socket.emit('join-session', sessionId);
  }

  updateCode(code, language) {
    if (!this.isConnected || !this.sessionId) {
      console.error('Not connected or no active session');
      return;
    }

    this.socket.emit('code-change', {
      sessionId: this.sessionId,
      code,
      language,
    });
  }

  updateCursor(position) {
    if (!this.isConnected || !this.sessionId) {
      return;
    }

    this.socket.emit('cursor-update', {
      sessionId: this.sessionId,
      position,
    });
  }

  onCodeUpdate(callback) {
    this.callbacks.onCodeUpdate = callback;
  }

  onCursorMove(callback) {
    this.callbacks.onCursorMove = callback;
  }

  onUserJoin(callback) {
    this.callbacks.onUserJoin = callback;
  }

  onUserLeave(callback) {
    this.callbacks.onUserLeave = callback;
  }

  onSessionUsers(callback) {
    this.callbacks.onSessionUsers = callback;
  }

  onError(callback) {
    this.callbacks.onError = callback;
  }

  onConnectionChange(callback) {
    this.callbacks.onConnectionChange = callback;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.sessionId = null;
      this.connectionAttempts = 0;
    }
  }
}

export const collaborationService = new CollaborationService(); 