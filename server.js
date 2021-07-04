const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const formatMessage = require('./utils/messages');

const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();

// creating the server
const server = http.createServer(app);

// Setting up our socketio
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Bot';

// Run when client connects
io.on('connection', socket => {
  
  socket.on('joinRoom', ({ username, room }) => {
    // add user to chat. 
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);


    // Welcomes the User
    // Difference between socket.emit, socket.broadcast, io.emit
    // 1- socket.emit() sends a message back to the user only. 
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Broadcast when a user connects
    // 2- socket.broadcast() sends the message to everyone BUT the user. 
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    // 3- io.emit() sends the data to everyone. 
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', message => {

    const user = getCurrentUser(socket.id);
    console.log(user)
    // sending the chat to everyone in the room. 
    io.to(user.room).emit('message', formatMessage(user.username, message));

  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Sending the data agian after the user disconnects. 
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

// This one takes the PORT set up if it's set up, if not, it will take port 3000
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));