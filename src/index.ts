/// <reference path="./index.d.ts" />
import getenv from 'getenv';
import http from 'http';
import socketRoutes from './routes/socket-io';
import app from './app';
const socketio = require('socket.io');

const PORT = getenv('PORT');
const NODE_ENV = getenv('NODE_ENV');

const server = new http.Server(app);
socketRoutes(socketio(server, {
  cors: {
    origin: '*',
  }
}));

server.listen(PORT, () => console.log(`Starting App (${NODE_ENV}) -- listening on port ${PORT} `));
