import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

let connectedPlayers = {
  sender: null,
  receiver: null
};

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('join', (role) => {
    console.log(`Join request: ${socket.id} as ${role}`);
    if (!connectedPlayers[role]) {
      connectedPlayers[role] = socket.id;
      socket.role = role;
      console.log(`Player joined: ${role}`);
      io.emit('playerJoined', { role, players: connectedPlayers });
    } else {
      console.log(`Role ${role} already taken`);
    }
  });

  socket.on('rocketLaunched', (data) => {
    console.log(`Rocket launched: ${JSON.stringify(data)}`);
    io.emit('rocketIncoming', data);
  });

  socket.on('disconnect', () => {
    console.log(`Disconnection: ${socket.id}`);
    if (socket.role) {
      connectedPlayers[socket.role] = null;
      console.log(`Player left: ${socket.role}`);
      io.emit('playerLeft', { role: socket.role, players: connectedPlayers });
    }
  });
});

httpServer.listen(3001, () => {
  console.log('Server running on port 3001');
}); 