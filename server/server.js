const path = require('path');
const express = require('express');
const socket = require('socket.io');
const http = require('http');
var app = express();
var server = http.createServer(app);
var {
    generateMessage
} = require('./utils/message.js');
const {
    isRealString
} = require('./utils/validation.js');
const {
    Users
} = require('./utils/users.js');
var io = socket(server);
var users = new Users();
app.use(express.static(path.join(__dirname, "../public")));


io.on('connection', (socket) => {


    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            callback("name and room are required");
        }

        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);
        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to chat app'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined ${params.room} room `))
        callback();
    })




    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', `${user.name} has left`);
        }
    });
    socket.on('createMessage', (message, callback) => {

        io.emit('newMessage', generateMessage(message.from, message.text));
        callback();
    })
});


server.listen(process.env.PORT || 3000, () => {
    console.log('server is running');
});