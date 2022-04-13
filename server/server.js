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

const port = process.env.PORT || 3000;

let rooms = {};

io.on('connection', (socket) => {
    // the current room from the client
    let currentRoomNumber = undefined;

    //server prints that a user connected to the server
    console.log(`User with the id '${socket.id}' connected`);

    //event when user enters a roomnumber
    socket.on('join', (roomNumber, callback) => {
        if (!rooms[roomNumber]) {
            //when room dont exist create the room and send a callback that the room is not full (false)
            console.log('kein raum gefunden');
            let roomArray = [];
            roomArray.push(socket.id);
            rooms[roomNumber] = roomArray;
            callback(false);
        } else if (rooms.hasOwnProperty(roomNumber)) {
            // if the room exists
            if (rooms[roomNumber].length == 2) {
                //when the room is full (max 2 players) send a callback that the room is full (true)
                console.log('raum ist voll');
                socket.emit('playerInRoom', rooms[roomNumber]);
                callback(true);
                return;
            }
            // if room is not full set the players in room to 2 and send a callback that room is not full (false)

            roomArray = rooms[roomNumber];
            roomArray.push(socket.id);
            rooms[roomNumber] = roomArray;
            console.log('raum gefunden');
            socket.to(roomNumber).emit('playerJoined', rooms[roomNumber]);
            callback(false);
        }

        // saves the current room for the client
        currentRoomNumber = roomNumber;

        // sets the requested room for the client
        socket.join(roomNumber);

        socket.to(roomNumber).emit('currentRoomPlayers', rooms[roomNumber]);

        console.log(`${socket.id} joined ${roomNumber}`);

        console.log(rooms);
    });

    socket.on('getAllPlayerInRoom', (roomNumber, callback) => {
        callback(rooms[roomNumber]);
    });

    socket.on('endTurn', (...arg) => {
        let empfang = [...arg];
        socket.to(currentRoomNumber).emit('test', empfang);
    });

    socket.on('disconnect', () => {
        if (currentRoomNumber !== undefined) {
            console.log(
                `${socket.id} disconnected from room: ${currentRoomNumber}`
            );
            console.log(currentRoomNumber);
            if (rooms[currentRoomNumber].length == 2) {
                let leavingUser = rooms[currentRoomNumber].indexOf(socket.id);

                rooms[currentRoomNumber] = rooms[currentRoomNumber].splice(
                    leavingUser - 1,
                    1
                );
                console.log(`users in room left: ${rooms[currentRoomNumber]}`);
            } else {
                console.log('delete room');
                delete rooms[currentRoomNumber];
            }
        } else {
            console.log(`${socket.id} disconnected.`);
        }
    });
});

httpServer.listen(port);
