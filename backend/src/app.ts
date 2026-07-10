import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import apiRouter from './routes/api';
import { seedAdminIfNeeded } from './controllers/authController';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure WebSockets
export const io = new Server(server, {
  cors: {
    origin: '*', // Allow connections from any origin for ease of development
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// REST API mounting
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Automated Attendance System Backend' });
});

// Socket.IO event handler
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  await connectDB();
  await seedAdminIfNeeded(); // Seed superadmin admin@attendance.com / admin123
  
  server.listen(PORT, () => {
    console.log(`⚡ Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  });
};

startServer();
