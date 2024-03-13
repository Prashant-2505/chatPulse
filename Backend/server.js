const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const path = require('path');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'https://chatpulse-w2g5.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use('/api/user/', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

// Deployment setup
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the 'build' directory
  app.use(express.static(path.join(__dirname1, 'frontend', 'build')));

  // Handle any other routes by serving the index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname1, 'frontend', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json('API is running');
  });
}

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'https://chatpulse-w2g5.onrender.com',
    methods: ['GET', 'POST'],
  },
});

// Connection created
io.on("connection", (socket) => {
  console.log(`Connected to socket.io`);

  // Logged in user join socket room
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // The person user wants to chat also join socket room
  socket.on('join chat', (room) => {
    socket.join(room);
    console.log("User joined" + room);
  });

  // Get message from socket server
  socket.on('new message', (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;
    if (!chat.users) {
      console.log("Chat users not defined");
    }
    // If it's a group chat, send message to all users except the sender
    chat.users.forEach(user => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  // Socket for typing
  socket.on('typing', (room) => {
    socket.in(room).emit('typing');
  });

  socket.on('stop typing', (room) => {
    socket.in(room).emit('stop typing');
  });

  // Turn socket off
  socket.on('disconnect', () => {
    console.log("User disconnected");
  });
});
