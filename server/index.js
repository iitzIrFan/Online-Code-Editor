const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));

// Create HTTP server
const httpServer = createServer(app);

// Socket.IO server with CORS configuration
const io = new Server(httpServer, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store active sessions and their participants
const sessions = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a coding session
  socket.on('join-session', (sessionId) => {
    try {
      console.log(`User ${socket.id} joining session ${sessionId}`);
      socket.join(sessionId);
      
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, new Set());
      }
      sessions.get(sessionId).add(socket.id);

      // Broadcast to others in the session
      socket.to(sessionId).emit('user-joined', {
        userId: socket.id,
        timestamp: new Date()
      });

      // Send current participants to the new user
      const participants = Array.from(sessions.get(sessionId));
      console.log(`Current participants in session ${sessionId}:`, participants);
      socket.emit('session-users', participants);
    } catch (error) {
      console.error('Error in join-session:', error);
      socket.emit('error', 'Failed to join session');
    }
  });

  // Handle code changes
  socket.on('code-change', ({ sessionId, code, language }) => {
    try {
      console.log(`Code change in session ${sessionId} by user ${socket.id}`);
      socket.to(sessionId).emit('code-update', {
        code,
        language,
        userId: socket.id
      });
    } catch (error) {
      console.error('Error in code-change:', error);
      socket.emit('error', 'Failed to broadcast code change');
    }
  });

  // Handle cursor position updates
  socket.on('cursor-update', ({ sessionId, position }) => {
    try {
      socket.to(sessionId).emit('cursor-move', {
        userId: socket.id,
        position
      });
    } catch (error) {
      console.error('Error in cursor-update:', error);
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    try {
      console.log('User disconnected:', socket.id);
      // Remove user from all sessions
      sessions.forEach((users, sessionId) => {
        if (users.has(socket.id)) {
          users.delete(socket.id);
          io.to(sessionId).emit('user-left', socket.id);
          console.log(`User ${socket.id} removed from session ${sessionId}`);
        }
      });
    } catch (error) {
      console.error('Error in disconnect handler:', error);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connections: io.engine.clientsCount,
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
}); 