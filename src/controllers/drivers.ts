import { Request, Response, NextFunction } from 'express';
import Sequelize from 'sequelize';
import createError from 'http-errors';
import { DateTime } from 'luxon';
import S3Logic from '../logic/s3';
import EmailsLogic from '../logic/emails';
import RoutesLogic from '../logic/routes';
import { getDriverJWT } from '../logic/users';
import models from '../models';
import DriversValidators from '../validators/drivers';
import RoutesEvents from '../logic/routes-events';

const emitter = RoutesEvents();

export default {
  authenticate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req;

      await DriversValidators.login(body);

      const route = await models.Routes.findOne({
        where: {
          end_date: null,
          code: body.code,
          password: body.password,
        },
      });

      if (!route) {
        throw createError(400, 'INVALID_AUTH_OR_ROUTE');
      }

      const token = getDriverJWT(<Route>route);

      await route.update({
        active_driver_jwt: token,
      });

      return res.send({
        token,
      });
    } catch (err) {
      return next(err);
    }
  },
  route: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.route;

      const route = await RoutesLogic.getRouteForDriver({
        id,
      });

      return res.send(route);
    } catch (err) {
      return next(err);
    }
  },
  setDriverName: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.route;
      const { body } = req;

      await DriversValidators.setName(body);

      const route = await models.Routes.findOne({
        where: { id },
      });

      await route.update(body);

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
  createStop: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.route;
      const { body, files } = req;

      await DriversValidators.createStop(body);

      const [signature, pictures] = await S3Logic.processStopFiles(<any>files);

      const created = await models.Stops.create({
        ...body,
        route_id: id,
        location: {
          type: 'Point',
          coordinates: [body.longitude, body.latitude],
        },
        signature_file: signature,
        pictures,
      });
      const stop = await models.Stops.findByPk(created.id);

      await RoutesLogic.markOrdersAsDelivered(id, parseInt(body.customer_id, 10), stop);

      const route = await RoutesLogic.getRouteForDriver({ id });

      emitter.emit('route-updated', { id });

      return res.send(route);
    } catch (err) {
      return next(err);
    }
  },
  addNavigation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.route;
      const { body } = req;

      await DriversValidators.addNavigation(body);

      const { customer_id, navigation } = body;

      await models.RoutesNavigations.create({
        customer_id,
        navigation: {
          ...navigation,
          routes: navigation.routes.map((route) => {
            const { legs, ...rest } = route;

            return rest;
          }),
        },
        route_id: id,
      });

      emitter.emit('route-updated', { id });

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
  startRoute: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.route;

      const route = await models.Routes.findOne({
        where: { id },
        attributes: ['id', 'tour_id', 'start_date', 'end_date', 'pathway'],
      });

      if (route.start_date) {
        return res.send({ status: 1 });
      }

      await route.update({ start_date: DateTime.now().toISO() });

      const customers = await models.Customers.findAll({
        where: {
          id: route.pathway.map((p) => p.id),
          email_notifications: true,
        },
        attributes: ['id', 'email_notifications', 'email'],
        raw: true,
      });

      if (customers.length) {
        const tour = await models.Tours.findOne({
          where: {
            id: route.tour_id,
          },
          attributes: ['id'],
          include: [{
            model: models.Suppliers,
            required: true,
          }],
        });
        const supplier = tour.Supplier.toJSON();

        customers.map((c) => EmailsLogic.notifyRouteStarted(c, supplier));
      }

      emitter.emit('route-updated', { id: route.id });

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
  endRoute: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.route;

      const route = await models.Routes.findOne({
        where: {
          id,
          start_date: {
            [Sequelize.Op.not]: null,
          },
        },
        attributes: ['id', 'start_date', 'end_date'],
      });

      if (!route) {
        throw createError(404, 'NOT_FOUND');
      }

      if (route.end_date) {
        throw createError(400, 'ROUTE_ALREADY_ENDED');
      }

      await route.update({ end_date: DateTime.now().toISO() });

      emitter.emit('route-updated', { id: route.id });

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
  location: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.route;
      const { body } = req;

      await DriversValidators.location(body);

      if (!Array.isArray(body)) {
        await models.DriversLocations.create({
          route_id: id,
          location: {
            type: 'Point',
            coordinates: [body.longitude, body.latitude],
          },
          created_at: body.created_at || DateTime.now().toISO(),
        });
      } else {
        await models.DriversLocations.bulkCreate(
          body.map((b) => ({
            route_id: id,
            location: {
              type: 'Point',
              coordinates: [b.longitude, b.latitude],
            },
            created_at: b.created_at || DateTime.now().toISO(),
          }))
        );
      }

      emitter.emit('route-updated', { id: id });

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
};
