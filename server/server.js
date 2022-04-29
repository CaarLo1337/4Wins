require('dotenv').config();

const { time } = require('console');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

const port = process.env.SERVER_PORT;

const timestamp = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;

let rooms = {};

io.on('connection', (socket) => {
    // the current room from the client
    let currentRoomNumber = undefined;

    //server prints that a user connected to the server
    console.log(`${timestamp} - new user with the ID '${socket.id}' connected to the server.`);

    //event when user enters a roomnumber
    socket.on('join', (roomNumber, callback) => {
        console.log(`${timestamp} - user with the ID '${socket.id}' sends request to join room '${roomNumber}'.`);
        if (!rooms[roomNumber]) {
            //when room dont exist create the room and send a callback that the room is not full (false)
            console.log(`${timestamp} - room '${roomNumber} was created by ID '${socket.id}'.`);
            let roomArray = [];
            roomArray.push(socket.id);
            rooms[roomNumber] = roomArray;
            callback(false);
        } else if (rooms.hasOwnProperty(roomNumber)) {
            // if the room exists
            if (rooms[roomNumber].length == 2) {
                //when the room is full (max 2 players) send a callback that the room is full (true)
                console.log(`${timestamp} - requested room '${roomNumber}' is full. request denied`);
                socket.emit('playerInRoom', rooms[roomNumber]);
                callback(true);
                return;
            }
            // if room is not full set the players in room to 2 and send a callback that room is not full (false)

            roomArray = rooms[roomNumber];
            roomArray.push(socket.id);
            rooms[roomNumber] = roomArray;
            console.log(`${timestamp} - user with ID '${socket.id}' joined room '${roomNumber}'`);
            socket.to(roomNumber).emit('playerJoined', rooms[roomNumber]);
            callback(false);
        }

        // saves the current room for the client
        currentRoomNumber = roomNumber;

        // sets the requested room for the client
        socket.join(roomNumber);

        socket.to(roomNumber).emit('currentRoomPlayers', rooms[roomNumber]);
    });

    socket.on('getAllPlayerInRoom', (roomNumber, callback) => {
        callback(rooms[roomNumber]);
    });

    socket.on('endTurn', (...arg) => {
        let empfang = [...arg];
        socket.to(currentRoomNumber).emit('test', empfang);
    });

    // socket.on('leave', (roomNumber) => {
    //     socket.leave(roomNumber);
    //     delete rooms[roomNumber]; // change this !!
    //     console.log(`${timestamp} - room ${roomNumber} - user left room`);
    // });

    socket.on('disconnect', () => {
        if (currentRoomNumber !== undefined) {
            console.log(`${timestamp} - ID '${socket.id}' disconnected from room '${currentRoomNumber}'.`);
            if (rooms[currentRoomNumber].length == 2) {
                let leavingUser = rooms[currentRoomNumber].indexOf(socket.id);
                socket.to(currentRoomNumber).emit('playerLeft');
                rooms[currentRoomNumber] = rooms[currentRoomNumber].splice(leavingUser - 1, 1);
            } else {
                console.log('delete room');
                delete rooms[currentRoomNumber];
            }
        } else {
            console.log(`${timestamp} - ID '${socket.id}' disconnected from the Server.`);
        }
    });
});

httpServer.listen(port);
