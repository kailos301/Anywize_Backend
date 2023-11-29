import debug from 'debug';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import RoutesEvents from '../logic/routes-events';
import { SECRET } from '../passport';

const Debug = debug('anywize:socket');
const emitter = RoutesEvents();

type SubscribeBody = {
  routes: number[];
};

type RouteUpdatedEvent = {
  id: number;
};

export default (io) => {
  emitter.on('route-updated', (data: RouteUpdatedEvent) => {
    Debug(`Route updated #${data.id}`);

    io.to(String(data.id)).emit('route-updated', data);
  });

  emitter.on('route-stop-skipped', (data: RouteUpdatedEvent) => {
    Debug(`Route stop skipped #${data.id}`);

    io.to(String(data.id)).emit('route-stop-skipped', data);
  });

  io
    .use(function(socket, next) {
      if (!socket.handshake.query || !socket.handshake.query.token) {
        return next(createError(401, 'AUTH'));
      }

      jwt.verify(socket.handshake.query.token, SECRET, function(err, decoded) {
        if (err) {
          return next(createError(401, 'AUTH'));
        }

        socket.decoded = decoded;

        return next();
      });
    })
    .on('connection', function(socket) {
      Debug(`Connection ${socket.id}`);

      socket.on('subscribe', (body: SubscribeBody) => {
        Debug(`Subscription update ${socket.id}:`, JSON.stringify(body.routes));

        socket.rooms.forEach((i) => {
          if (i !== socket.id) {
            socket.leave(i);
          }
        });

        body.routes.forEach((i) => socket.join(String(i)));

        Debug(`Rooms after update ${socket.id}: `, socket.rooms);
      });

      socket.on('disconnecting', () => {
        socket.rooms.forEach((i) => socket.leave(i));
      });

      socket.on('disconnect', () => {
        Debug(`Disconnected ${socket.id}`);
      });
    });
};
