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
app.use(cors());

app.use('/api/user/', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);



//!-------------Deployment ------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: 'https://chatpulse-w2g5.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));

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

//!----------------------------------------------

const port = 5000;

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


// connection created
io.on("connection", (socket) => {
  console.log(`connected to socket.io`)

// logged in user join socket room
  socket.on('setup', (userData) => {
    socket.join(userData._id)
    socket.emit("connected")
  })


// the person user want to chat also join socket room
  socket.on('join chat', (room) => {
    socket.join(room)
    console.log("user joined" + room)
  })


 // get message from socket server
  socket.on('new message', (newMessageRecieved) => {
    var chat = newMessageRecieved.chat
    if (!chat.users) {
      console.log("chat users not defined")
    }
// if its grp chat chat then send message to all users ecpect one who sending 
    chat.users.forEach(user => {
      if (user._id == newMessageRecieved.sender._id) return

      socket.in(user._id).emit("message recieved", newMessageRecieved)
    })
  }
  )


// socket for typing
  socket.on('typing', (room) => {
  socket.in(room).emit('typing')
  })

  socket.on('stop typing', (room) => {
    socket.in(room).emit('stop typing')
    })



    // turn socket off
    socket.off('setup',()=>{
      console.log("user disconnected")
      socket.leave(userData._id)
    })
})

