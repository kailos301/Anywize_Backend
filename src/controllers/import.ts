import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import models from '../models';
import RoutesLogic from '../logic/routes';
import CustomersLogic from '../logic/customers';
import ImportValidators from '../validators/import';

export default {
  complete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body }: { body: ImportBodyComplete } = req;

      console.log(body);

      await ImportValidators.complete(body);

      const supplier = await models.Suppliers.findOne({
        where: {
          number: body.supplier_id.trim(),
          secret: body.secret.trim(),
        },
        raw: true,
      });

      if (!supplier) {
        throw createError(400, 'SUPPLIER_NOT_FOUND');
      }

      const _e = body.Orders.every((o) => {
        const customer = body.Customers.find((c) => c.id.trim() === o.customer_id.trim());

        return !!customer;
      });

      if (!_e) {
        throw createError(400, 'ORDER_MISSING_CUSTOMER');
      }

      const ta = await models.TransportAgents.findOne();

      const [tour] = await models.Tours.findOrCreate({
        where: {
          number: body.Tour.id.trim(),
          supplier_id: supplier.id,
        },
        defaults: {
          supplier_id: supplier.id,
          transport_agent_id: ta.id,
          number: body.Tour.id.trim(),
          name: body.Tour.name.trim(),
          description: 'Imported tour',
        },
      });

      const customers: Customer[] = await Promise.all(
        body.Customers.map((c) => {
          return models.Customers.findOrCreate({
            where: {
              number: c.id.trim(),
              tour_id: tour.id,
            },
            defaults: {
              supplier_id: supplier.id,
              tour_id: tour.id,
              tour_position: 1,
              number: c.id.trim(),
              name: c.name,
              alias: c.alias || c.name,
              street: c.street,
              street_number: c.street_number,
              city: c.city,
              zipcode: c.zipcode,
              country: c.country || 'DE',
              ...(
                c.longitude && c.latitude
                  ? {
                    coordinates: {
                      type: 'Point',
                      coordinates: [c.longitude, c.latitude],
                    },
                  }
                  : {}
              ),
              deposit_agreement: c.deposit_agreement,
              keybox_code: c.keybox_code,
              email: c.email,
              phone: c.phone,
              contact_name: c.contact_name,
              contact_surname: c.contact_surname,
            }
          }).then(async ([customer, isNew]) => {
            let _res = null;

            if (customer.coordinates?.coordinates[0] === 0 && customer.coordinates?.coordinates[1] === 0) {
              _res = await CustomersLogic.geocode(`${customer.street} ${customer.street_number}, ${customer.city}, Germany`);
            }

            if (!isNew) {
              return customer.update({
                name: c.name,
                alias: c.alias || c.name,
                street: c.street,
                street_number: c.street_number,
                city: c.city,
                zipcode: c.zipcode,
                country: c.country || 'DE',
                deposit_agreement: c.deposit_agreement,
                keybox_code: c.keybox_code,
                email: c.email,
                phone: c.phone,
                contact_name: c.contact_name,
                contact_surname: c.contact_surname,
                ..._res
              }).then((_c) => _c.toJSON());
            } else if (_res) {
              return customer.update({ ..._res }, { logging: console.log }).then((_c) => _c.toJSON());;
            }

            return customer.toJSON();
          });
        })
      );

      const orders: Order[] = await Promise.all(
        body.Orders.map((o) => {
          const customer = customers.find((c) => c.number === o.customer_id.trim());

          if (!customer) {
            return Promise.resolve();
          }

          return models.Orders.create({
            supplier_id: supplier.id,
            customer_id: customer.id,
            description: o.description,
            number: o.number,
          }).then((o) => o.toJSON());
        })
      );

      try {
        const route = await RoutesLogic.create({
          order_ids: orders.map((o) => o.id),
          tour_id: tour.id,
        }, {
          supplier_id: supplier.id
        } as User);

        return res.send(route);
      } catch (err) {
        await models.Orders.destroy({
          where: {
            id: orders.map((o) => o.id),
          },
        });

        throw err;
      }
    } catch (err) {
      return next(err);
    }
  },
  import: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body }: { body: ImportBody } = req;

      if (!body.Lieferungen || !body.Lieferungen.length) {
        return res.send({ status: 1, uuid: 'OMITTED_NO_ORDERS' });
      }

      const supplier = await models.Suppliers.findOne({
        where: {
          number: body.Lieferanten_ID.trim(),
        },
        raw: true,
      });

      if (!supplier) {
        throw createError(400, 'SUPPLIER_NOT_FOUND');
      }

      const ta = await models.TransportAgents.findOne();

      const [tour] = await models.Tours.findOrCreate({
        where: {
          number: body.ID_Tour.trim(),
          supplier_id: supplier.id,
        },
        defaults: {
          supplier_id: supplier.id,
          transport_agent_id: ta.id,
          number: body.ID_Tour.trim(),
          name: body.Tour_Name,
          description: 'Imported tour',
        },
      });

      const customers: Customer[] = await Promise.all(
        body.Kontakte.map((c) => {
          return models.Customers.findOrCreate({
            where: {
              number: c.ID_Kontakte.trim(),
              tour_id: tour.id,
              supplier_id: supplier.id,
            },
            defaults: {
              supplier_id: supplier.id,
              tour_id: tour.id,
              tour_position: c.Prioritaet,
              number: c.ID_Kontakte.trim(),
              name: c.Firma,
              alias: c.Firma,
              street: c.Strasse,
              street_number: c.Hausnummer,
              city: c.Ort,
              zipcode: c.PLZ,
              country: 'DE',
            }
          }).then(([customer, isNew]) => {
            if (!isNew) {
              return customer.update({
                tour_position: c.Prioritaet,
                number: c.ID_Kontakte.trim(),
                name: c.Firma,
                alias: c.Firma,
                street: c.Strasse,
                street_number: c.Hausnummer,
                city: c.Ort,
                zipcode: c.PLZ,
              }).then((c) => c.toJSON());
            }

            return CustomersLogic.geocode(`${customer.street} ${customer.street_number}, ${customer.city}, Germany`)
              .then((res) => {
                if (!res) {
                  return customer.toJSON();
                }

                return customer.update({ ...res })
                  .then((c) => c.toJSON());
              })
          });
        }),
      );

      const orders: Order[] = await Promise.all(
        body.Lieferungen.map((o) => {
          const customer = customers.find((c) => c.number === o.FRD_ID_Kontakte);

          if (!customer) {
            return Promise.resolve();
          }

          return models.Orders.create({
            supplier_id: supplier.id,
            customer_id: customer.id,
            description: 'Importierter Auftrag',
            number: o['tbl_Lieferung.ID_Lieferung'],
          }).then((o) => o.toJSON());
        })
      );

      try {
        const route = await RoutesLogic.create({
          order_ids: orders.map((o) => o.id),
          tour_id: tour.id,
        }, {
          supplier_id: supplier.id
        } as User);

        return res.send(route);
      } catch (err) {
        await models.Orders.destroy({
          where: {
            id: orders.map((o) => o.id),
          },
        });

        throw err;
      }
    } catch (err) {
      return next(err);
    }
  },
};
