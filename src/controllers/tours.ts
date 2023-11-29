import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import models from '../models';
import ToursValidator from '../validators/tours';

export default {
  nextPosition: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const customer = await models.Customers.findOne({
        where: {
          tour_id: id,
        },
        raw: true,
        attributes: ['id', 'tour_position'],
        order: [['tour_position', 'DESC']],
      });

      return res.send({ tour_position: customer ? customer.tour_position + 1 : 1 });
    } catch (err) {
      return next(err);
    }
  },
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { limit, offset } = req.query;

      const { rows, count } = await models.Tours.findAndCountAll({
        limit: parseInt(<any>limit || 2000, 10),
        offset: parseInt(<any>offset || 0, 10),
        raw: true,
        where: {
          active: true,
          supplier_id: user.supplier_id,
        },
        order: [['id', 'DESC']],
      });

      res.set('x-total-count', count);

      return res.send(rows);
    } catch (err) {
      return next(err);
    }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { user } = req;

      const tour = await models.Tours.findOne({
        where: {
          id,
          supplier_id: user.supplier_id,
        },
        include: [{
          model: models.TransportAgents,
          attributes: ['id', 'name', 'alias'],
        }],
      });

      if (!tour) {
        throw createError(404, 'NOT_FOUND');
      }

      return res.send(tour);
    } catch (err) {
      return next(err);
    }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body, user } = req;

      await ToursValidator.create(body);

      const tour = await models.Tours.create({
        ...body,
        holding_id: user.holding_id,
        supplier_id: user.supplier_id,
      });

      return res.send(tour);
    } catch (err) {
      return next(err);
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body, user } = req;
      const { id } = req.params;

      await ToursValidator.update(body);

      const tour = await models.Tours.findOne({
        where: {
          id,
          supplier_id: user.supplier_id,
        },
      });

      if (!tour) {
        throw createError(404, 'NOT_FOUND');
      }

      const updated = await tour.update(body);

      return res.send(updated);
    } catch (err) {
      return next(err);
    }
  },
  destroy: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { id } = req.params;

      const tour = await models.Tours.findOne({
        where: {
          id,
          supplier_id: user.supplier_id,
        },
      });

      if (!tour) {
        return res.send({ status: 1 });
      }

      const customers = await models.Customers.count({
        where: {
          tour_id: tour.id,
        },
      });

      if (customers) {
        throw createError(400, 'TOUR_CONTAINS_CUSTOMERS');
      }

      await tour.destroy();

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
};
