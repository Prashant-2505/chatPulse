const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

dotenv.config();
connectDB();

const app = express();
app.use(express.json())

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/user/', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)

// error handeling if the api is different than we created
app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 5000; 
const mongoUri = process.env.MONGO_URI; 

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const io = require('socket.io')(server, {
  pingTimeout: 6000,
  cors: {
    origin: 'http://localhost:3000'
  },
})

io.on('connection', (socket) => {
  console.log('connected to socket.io')



  socket.on('setup', (userData) => {
    socket.join(userData._id)
    socket.emit('connected')
  })


  socket.on('typing', (room) => socket.in(room).emit('typing'))
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'))


  socket.on('join chat', (room) => {
    socket.join(room)
    console.log('User joined room => ', room)
  })



  socket.on('new message', (newMessageRecieved) => {
    var chat = newMessageRecieved.chat
    if (!chat) return console.log('chat.user not defined')

    chat.users.forEach(user => {
      if (user._id == newMessageRecieved.sender._id)
        return
      socket.in(user._id).emit("message recieved", newMessageRecieved)
    })
  })

  socket.off("setup",()=>
  {
    console.log("user disconnected")
    socket.leave(userData._id)
  })
})
console.log('ok')

