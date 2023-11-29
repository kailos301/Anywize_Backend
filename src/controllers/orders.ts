import { Request, Response, NextFunction } from 'express';
import Sequelize from 'sequelize';
import createError from 'http-errors';
import { DateTime } from 'luxon';
import models from '../models';
import OrdersValidators from '../validators/orders';
import { extendedQueryString } from '../logic/query';

const query = extendedQueryString({
  assigned_to_route: {
    key: 'route_id',
    func: (val) => {
      if (val === '1') {
        return {
          [Sequelize.Op.not]: null,
        };
      }

      return null;
    },
  },
});

export default {
  delivered: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { from, to } = req.params;

      await OrdersValidators.delivered({ from, to });

      const customers = await models.Customers.findAll({
        attributes: ['id', 'name', 'alias'],
        where: {
          supplier_id: user.supplier_id,
          one: Sequelize.literal('`Orders->Route->Stops`.`customer_id` = `Customers`.`id`'),
        },
        include: [{
          model: models.Orders,
          where: {
            delivered_at: {
              [Sequelize.Op.not]: null,
              [Sequelize.Op.gte]: DateTime.fromISO(from).startOf('day').toJSDate(),
              [Sequelize.Op.lte]: DateTime.fromISO(to).endOf('day').toJSDate(),
            },
          },
          attributes: ['id', 'delivered_at', 'description', 'number'],
          required: true,
          include: [{
            model: models.Routes,
            attributes: ['id', 'uuid'],
            include: [{
              model: models.Stops,
              attributes: ['meet_customer'],
            }],
          }],
        }, {
          model: models.Tours,
          attributes: ['id', 'name'],
        }],
      });

      return res.send(customers);
    } catch (err) {
      return next(err);
    }
  },
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { limit, offset } = req.query;
      const { where } = query(req.query);

      const { rows, count } = await models.Orders.findAndCountAll({
        limit: parseInt(<any>limit || 2000, 10),
        offset: parseInt(<any>offset || 0, 10),
        order: [['id', 'DESC']],
        where: {
          ...(!user.permissions?.orderListHolding ? { created_by_user_id: user.id } : {}),
          supplier_id: user.supplier_id,
          ...where,
        },
        include: [{
          required: true,
          model: models.Customers,
          attributes: ['id', 'name', 'alias'],
          include: [{
            model: models.Tours,
            attributes: ['id', 'name'],
          }],
        }],
      });

      res.set('x-total-count', count);

      return res.send(rows);
    } catch (err) {
      return next(err);
    }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { id } = req.params;

      const order = await models.Orders.findOne({
        where: {
          id,
          supplier_id: user.supplier_id,
        },
        include: [{
          model: models.Customers,
          attributes: [
            'id', 'tour_id', 'tour_position', 'name', 'alias',
            'street', 'street_number', 'city', 'zipcode', 'country', 'email', 'phone',
          ],
          include: [{
            model: models.Tours,
            attributes: ['id', 'name'],
          }],
        }],
      });

      if (!order) {
        throw createError(404, 'NOT_FOUND');
      }

      return res.send(order);
    } catch (err) {
      return next(err);
    }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, body } = req;

      await OrdersValidators.create(body);

      const customer = await models.Customers.count({
        where: {
          id: body.customer_id,
          supplier_id: user.supplier_id,
        },
      });

      if (!customer) {
        throw createError(400, 'INVALID_CUSTOMER');
      }

      const order = await models.Orders.create({
        ...body,
        holding_id: user.holding_id,
        supplier_id: user.supplier_id,
        created_by_user_id: user.id,
      });

      return res.send(order);
    } catch (err) {
      return next(err);
    }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, body } = req;
      const { id } = req.params;

      await OrdersValidators.update(body);

      const order = await models.Orders.findOne({
        where: {
          id,
          supplier_id: user.supplier_id,
        },
      });

      if (!order) {
        throw createError(404, 'NOT_FOUND');
      }

      if (order.route_id) {
        throw createError(400, 'ORDER_ALREADY_IN_ROUTE');
      }

      const customer = await models.Customers.count({
        where: {
          id: body.customer_id,
          supplier_id: user.supplier_id,
        },
      });

      if (!customer) {
        throw createError(400, 'INVALID_CUSTOMER');
      }

      const updated = await order.update(body);

      return res.send(updated);
    } catch (err) {
      return next(err);
    }
  },
  destroy: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { id } = req.params;

      const order = await models.Orders.findOne({
        where: {
          id,
          supplier_id: user.supplier_id,
        },
      });

      if (!order) {
        return res.send({ status: 1 });
      }

      if (order.route_id) {
        throw createError(400, 'ORDER_ALREADY_IN_ROUTE');
      }

      await order.destroy();

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
};
