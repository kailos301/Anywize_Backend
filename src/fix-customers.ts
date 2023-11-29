import Sequelize from 'sequelize';
import models from './models/index';



const _tours = async () => {
  const tours = await models.Tours.findAll({
    order: [['id', 'ASC']],
    raw: true,
    attributes: ['id', 'name', 'number', 'supplier_id'],
    where: {
      number: {
        [Sequelize.Op.not]: null,
      },
    },
  });

  const resolved = [];

  for (const tour of tours) {
    if (!tour.number || !tour.number.trim()) {
      continue;
    }

    if (resolved.includes(tour.number.trim())) {
      continue;
    }

    const similar = await models.Tours.findAll({
      where: {
        number: models.sequelize.literal(`TRIM(number) = "${tour.number.trim()}"`),
        name: models.sequelize.literal(`TRIM(name) = "${tour.name.trim()}"`),
        supplier_id: tour.supplier_id,
        id: {
          [Sequelize.Op.not]: tour.id,
        },
      },
      raw: true,
      attributes: ['id', 'name', 'number'],
      logging: console.log,
    });

    if (similar.length) {
      console.log(`Tour #${tour.id} with number "${tour.number}" has ${similar.length} similar tours:`)
      console.log(similar.map((s) => `- #${s.id}, number: "${s.number}"`).join('\n'));
      console.log('---');

      const repeatedTourIds = similar.map((s) => s.id);

      const customers = await models.Customers.findAll({
        where: {
          tour_id: repeatedTourIds,
        },
        attributes: ['id', 'name'],
        raw: true,
      });

      console.log('Customers that need to be updated: ' + customers.length);

      await models.Customers.update({
        tour_id: tour.id,
      }, {
        where: {
          tour_id: repeatedTourIds,
        },
      });

      const routes = await models.Routes.findAll({
        where: {
          tour_id: repeatedTourIds,
        },
        raw: true,
        attributes: ['id', 'tour_id', 'pathway'],
      });

      console.log('Routes that need to be updated: ' + routes.length);

      for (const route of routes) {
        await models.Routes.update({
          pathway: route.pathway.map((path) => {
            if (!repeatedTourIds.includes(path.tour_id)) {
              return path;
            }

            return {
              ...path,
              tour_id: tour.id,
            };
          }),
          tour_id: tour.id,
        }, {
          where: { id: route.id },
          limit: 1,
        });
      }

      await models.Tours.destroy({
        where: {
          id: repeatedTourIds,
        },
      });

      resolved.push(tour.number.trim());
    }
  }

  console.log('Gdo');
};

const _customers = async () => {
  const customers = await models.Customers.findAll({
    order: [['id', 'ASC']],
    raw: true,
    attributes: ['id', 'name', 'number', 'tour_id', 'supplier_id'],
    where: {
      number: {
        [Sequelize.Op.not]: null,
      },
    },
  });

  const resolved = [];

  for (const customer of customers) {
    if (!customer.number || !customer.number.trim()) {
      continue;
    }

    if (resolved.includes(customer.number.trim())) {
      continue;
    }

    const similar = await models.Customers.findAll({
      where: {
        number: models.sequelize.literal(`TRIM(number) = "${customer.number.trim()}"`),
        name: models.sequelize.literal(`TRIM(name) = "${customer.name.trim()}"`),
        id: {
          [Sequelize.Op.not]: customer.id,
        },
        supplier_id: customer.supplier_id,
      },
      raw: true,
      attributes: ['id', 'name', 'number', 'tour_id'],
      logging: console.log,
    });

    if (similar.length) {
      console.log(`Customer #${customer.id} with number "${customer.number}" has ${similar.length} similar customers:`)
      console.log(similar.map((s) => `- #${s.id}, number: "${s.number}"`).join('\n'));
      console.log('---');

      const repeatedCustomerIds = similar.map((s) => s.id);

      const orders = await models.Orders.findAll({
        where: {
          customer_id: repeatedCustomerIds,
        },
        raw: true,
        attributes: ['id', 'customer_id'],
      });

      console.log('Orders that need to be updated: ' + orders.length);

      await models.Orders.update({
        customer_id: customer.id,
      }, {
        where: {
          customer_id: repeatedCustomerIds,
        },
      });

      const stops = await models.Stops.findAll({
        where: {
          customer_id: repeatedCustomerIds,
        },
        raw: true,
        attributes: ['id', 'customer_id'],
      });

      console.log('Stops that need to be updated: ' + stops.length);

      await models.Stops.update({
        customer_id: customer.id,
      }, {
        where: {
          customer_id: repeatedCustomerIds,
        },
      });

      await models.RoutesNavigations.update({
        customer_id: customer.id,
      }, {
        where: {
          customer_id: repeatedCustomerIds,
        },
      });

      const routes = await models.Routes.findAll({
        where: {
          tour_id: similar.map((s) => s.tour_id),
        },
        raw: true,
        attributes: ['id', 'tour_id', 'pathway'],
      });

      console.log('Routes that need to be updated: ' + routes.length);

      for (const route of routes) {
        await models.Routes.update({
          pathway: route.pathway.map((path) => {
            if (!repeatedCustomerIds.includes(path.id)) {
              return path;
            }

            return {
              ...path,
              id: customer.id,
              Orders: path.Orders.map((o) => {
                return {
                  ...o,
                  customer_id: customer.id,
                };
              }),
            };
          }),
        }, {
          where: { id: route.id },
          limit: 1,
        });
      }

      await models.Customers.destroy({
        where: {
          id: repeatedCustomerIds,
        },
      });

      resolved.push(customer.number.trim());
    }
  }
};

setTimeout(() => {
  _tours().then(() => _customers());
}, 2000);
