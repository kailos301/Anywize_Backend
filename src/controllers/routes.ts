import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import Sequelize from "sequelize";
import { groupBy } from "lodash";
import * as ejs from "ejs";
import axios from 'axios';
import { DateTime } from "luxon";
import models from "../models";
import RoutesLogic from "../logic/routes";
import S3Logic from "../logic/s3";
import RoutesValidators from "../validators/routes";
import { parseFilterDates, extendedQueryString } from "../logic/query";
import RoutesEvents from "../logic/routes-events";
const { Readable } = require('stream');

const emitter = RoutesEvents();

const query = extendedQueryString({
  started: {
    key: "start_date",
    func: (v) => {
      if (v === "1") {
        return {
          [Sequelize.Op.not]: null,
        };
      }

      return null;
    },
  },
  ended: {
    key: "end_date",
    func: (v) => {
      if (v === "1") {
        return {
          [Sequelize.Op.not]: null,
        };
      }

      return null;
    },
  },
});

export default {
  export: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { from, to } = req.params;

      await RoutesValidators.export({ from, to });

      res.set("Content-disposition", "attachment; filename=export.xlsx");
      res.set(
        "content-type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      const stream = await RoutesLogic.export({ from, to }, user);

      stream.pipe(res);
    } catch (err) {
      return next(err);
    }
  },
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { limit, offset } = req.query;
      const { where } = query(req.query);
      const {
        start_date_to,
        start_date_from,
        end_date_from,
        end_date_to,
        ...rest
      } = where;
      const whereDates = parseFilterDates(req.query);

      const { rows, count } = await models.Routes.findAndCountAll({
        limit: parseInt(<any>limit || 2000, 10),
        offset: parseInt(<any>offset || 0, 10),
        where: {
          tour_id: {
            [Sequelize.Op.in]: models.sequelize.literal(
              `(SELECT tours.id FROM tours WHERE supplier_id = ${user.supplier_id})`
            ),
          },
          // ...rest,
          // ...whereDates,
        },
        order: [["id", "DESC"]],
        attributes: [
          "id",
          "uuid",
          "start_date",
          "end_date",
          "code",
          "password",
          "driver_name",
          "driver_phone",
          "pathway",
        ],
        include: [
          {
            model: models.Tours,
            attributes: ["id", "name"],
          },
        ],
        distinct: true,
      });

      res.set("x-total-count", count);

      return res.send(rows);
    } catch (err) {
      return next(err);
    }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { user } = req;
      const { allDriverLocations } = req.query;

      const route = await RoutesLogic.get(
        {
          id,
          tour_id: {
            [Sequelize.Op.in]: models.sequelize.literal(
              `(SELECT tours.id FROM tours WHERE supplier_id = ${user.supplier_id})`
            ),
          },
        },
        !!allDriverLocations
      );

      return res.send(route);
    } catch (err) {
      return next(err);
    }
  },
  pdf: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { user } = req;

      const record = await models.Routes.findOne({
        where: {
          id,
          tour_id: {
            [Sequelize.Op.in]: models.sequelize.literal(
              `(SELECT tours.id FROM tours WHERE supplier_id = ${user.supplier_id})`
            ),
          },
        },
        include: [
          {
            model: models.Orders,
            include: [
              {
                model: models.Users,
                attributes: ["id", "name", "surname"],
              },
            ],
          },
          {
            model: models.Tours,
          },
        ],
      });
      if (!record) {

        throw createError(404, "NOT_FOUND");
      }
      const route = record.toJSON();

      if (typeof route.pathway === "string") {
        route.pathway = JSON.parse(route.pathway)
      }
      for (const pathway of route.pathway) {
        pathway.Orders.sort((a, b) => b.User ? b.User.name : true);
      }
      console.info('record: ', route)
      const orders = groupBy(route.Orders, "User.id");

      ejs.renderFile(
        `${process.cwd()}/templates/route-document.ejs`,
        { route: route, orders: Object.values(orders), DateTime },
        {},
        (err, str) => {
          if (err) {
            throw err;
          }
          return res.send(str)

          // res.setHeader('Content-Disposition', `attachment; filename=${route.uuid}.pdf`);

          axios.post(
            'http://18.184.221.195:3001/html-to-pdf',
            {
              body: str,
              margin: {
                left: "2cm",
                top: "2cm",
                bottom: "2cm",
                right: "2cm",
              },
            },
            {
              responseType: "arraybuffer",
              auth: {
                username: "admin",
                password: "gdo",
              },
            }
          ).then(({ data }) => {
            const stream = Readable.from(data);

            stream.pipe(res);
          });
        }
      );
    } catch (err) {
      return next(err);
    }
  },
  proofOfDelivery: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, customerId } = req.params;
      const { user } = req;

      const route = await models.Routes.findOne({
        where: {
          id,
          tour_id: {
            [Sequelize.Op.in]: models.sequelize.literal(
              `(SELECT tours.id FROM tours WHERE supplier_id = ${user.supplier_id})`
            ),
          },
        },
        attributes: ["id"],
        raw: true,
      });

      if (!route) {
        throw createError(404, "NOT_FOUND");
      }

      const record = await models.Stops.findOne({
        where: {
          customer_id: customerId,
          route_id: route.id,
        },
        include: [
          {
            model: models.Customers,
            required: true,
            include: [
              {
                model: models.Orders,
                required: true,
                where: {
                  route_id: route.id,
                },
                attributes: ["id", "number", "description"],
              },
            ],
          },
        ],
      });

      if (!record) {
        throw createError(404, "NOT_FOUND");
      }

      const stop = {
        ...record.toJSON(),
        ...record,
        signature_file: record.signature_file
          ? S3Logic.getSignedUrl(record.signature_file)
          : null,
        pictures: record.pictures.map((p) => S3Logic.getSignedUrl(p)),
        delivery_date_formatted: DateTime.fromISO(record.time.toISOString(), {
          zone: "Europe/Berlin",
        }).toFormat("dd.MM.yyyy HH:mm"),
      };

      ejs.renderFile(
        `${process.cwd()}/templates/proof-of-delivery.ejs`,
        { stop },
        {},
        (err, str) => {
          if (err) {
            throw err;
          }

          // res.setHeader('Content-Disposition', `attachment; filename=${stop.Customer.alias}.pdf`);

          axios.post(
            'http://18.184.221.195:3001/html-to-pdf',
            {
              body: str,
              margin: {
                left: "2cm",
                top: "2cm",
                bottom: "2cm",
                right: "2cm",
              },
            },
            {
              responseType: "arraybuffer",
              auth: {
                username: "admin",
                password: "gdo",
              },
            }
          ).then(({ data }) => {
            const stream = Readable.from(data);

            stream.pipe(res);
          });
        }
      );
    } catch (err) {
      return next(err);
    }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body, user } = req;

      await RoutesValidators.create(body);

      const route = await RoutesLogic.create(body, user);

      return res.send(route);
    } catch (err) {
      return next(err);
    }
  },
  destroy: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { id } = req.params;

      const route = await models.Routes.findOne({
        where: {
          id,
          tour_id: {
            [Sequelize.Op.in]: models.sequelize.literal(
              `(SELECT tours.id FROM tours WHERE supplier_id = ${user.supplier_id})`
            ),
          },
        },
      });

      if (!route) {
        return res.send({ status: 1 });
      }

      if (route.start_date) {
        throw createError(400, "ROUTE_STARTED");
      }

      await RoutesLogic.unlinkOrders(route);
      await route.destroy();

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
  skipStop: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      const { id, customer_id } = req.params;

      const route = await models.Routes.findOne({
        where: {
          id,
          tour_id: {
            [Sequelize.Op.in]: models.sequelize.literal(
              `(SELECT tours.id FROM tours WHERE supplier_id = ${user.supplier_id})`
            ),
          },
        },
      });

      if (!route) {
        throw createError(404, "NOT_FOUND");
      }

      const index = route.pathway.findIndex(
        (p) => p.id === parseInt(customer_id, 10)
      );

      if (index === -1) {
        throw createError(400, "INVALID_CUSTOMER");
      }

      if (route.pathway[index].Orders.some((o) => o.delivered_at)) {
        throw createError(400, "INVALID_CUSTOMER");
      }

      const newPathway = [
        ...route.pathway.slice(0, index),
        {
          ...route.pathway[index],
          skipped_at: DateTime.now().toISO(),
        },
        ...route.pathway.slice(index + 1),
      ];

      await route.update({ pathway: newPathway });

      emitter.emit("route-updated", { id });
      emitter.emit("route-stop-skipped", { id });

      return res.send({ status: 1 });
    } catch (err) {
      return next(err);
    }
  },
};
