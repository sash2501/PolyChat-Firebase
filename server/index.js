const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js')

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

const users = {};

io.on("connect", (socket) => {
  socket.on('join room', ({name, room}, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room});

    if(error) return callback(error);
    
    console.log("New Connection added ---",name, room);
    //console.log(name, room);

    socket.emit('message', { user: 'Jarvis', text: `${user.name}, welcome to room ${user.room}`} )

    socket.broadcast.to(user.room).emit('message', {user: 'Jarvis', text: `${user.name} has joined :D`})

    socket.broadcast.to(user.room).emit('transcript', {user: 'Jarvis', text: `${user.name} is going to speak`})

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    socket.broadcast.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })


    socket.emit("all users", getUsersInRoom(user.room));

    socket.join(user.room); ///name of room to join
    
    callback();
  })

  socket.on('sendTranscript', (transcript, callback) => {
    const user = getUser(socket.id);
    console.log("send transcipt emiited", user);

    io.to(user.room).emit('transcript', { user: user.name, text: transcript})
    callback();

  })

  socket.on('sendMessage', (messageFromBox, callback)=> {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: messageFromBox})
    callback();
  })

  socket.on('sendNotes', (noteFromPad, callback) => {
    console.log("received notes", noteFromPad);
    const user = getUser(socket.id);

    socket.broadcast.to(user.room).emit('notes', {text: noteFromPad})

    callback();
  })

  socket.on("sending signal", payload => {
        //console.log("sending signal ",payload.userToSignal)
        //socket.broadcast.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        //console.log("in returning signal ",payload.callerID )
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

  socket.on('disconnect' ,()=> {
    const user = removeUser(socket.id);
    
      if(user) {
        io.to(user.room).emit('message',{user: 'Jarvis', text: `${user.name} has left :(`})
        
        //io.to(user.room).emit('user-left', socket.id); 
        socket.broadcast.to(user.room).emit('user left', socket.id);
        
        io.to(user.room).emit('roomData', { users: getUsersInRoom(user.room)});
      
      }
      console.log("User left!!!");
    })
});


server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));