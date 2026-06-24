import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Backend is running', timestamp: new Date() });
});

app.get('/api', (req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to My Study Life API',
    version: '0.1.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      schedules: '/api/schedules',
      exercises: '/api/exercises'
    }
  });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('join-room', (room: string) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('break-reminder', (data: any) => {
    io.to(data.userId).emit('notification', {
      type: 'break-reminder',
      message: '⏰ Đến lúc nghỉ ngơi rồi!',
      data: data
    });
  });

  socket.on('study-reminder', (data: any) => {
    io.to(data.userId).emit('notification', {
      type: 'study-reminder',
      message: '📚 Đến lúc học tập rồi!',
      data: data
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🔌 Socket.io ready for real-time connections`);
});

export { app, io, server };
