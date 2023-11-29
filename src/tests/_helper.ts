import supertest from 'supertest';
import faker from 'faker';
import _ from 'lodash';
import getenv from 'getenv';
import models from '../models';
import * as UsersLogic from '../logic/users';
import RoutesLogic from '../logic/routes';

const PORT = getenv('PORT');

let adminUser;
let holding;
let supplier;
let transportAgent;

export const request = supertest(`http://localhost:${PORT}`);

export const delay = (ms) => new Promise((resolve): void => {
  setTimeout(() => resolve(true), ms);
});

export const createHolding = async (forceNew = false, data = {}): Promise<Holding> => {
  if (!forceNew && holding) {
    return holding;
  }
  const created = await models.Holdings.create({
    name: `Name - ${faker.company.companyName()}`,
    alias: `Alias - ${faker.company.companyName()}`,
    street: 'street',
    street_number: '123123',
    city: 'City',
    zipcode: '123',
    country: 'AR',
    email: faker.internet.email().toLowerCase(),
    phone: '123123123',
    number: '0000',
    active: true,
    ...data,
  });

  if (forceNew) {

    return created.toJSON();
  }
  holding = created.toJSON();

  // console.info('create holding-> ', holding)

  return holding;
}

export const createSupplier = async (forceNew = false, data = {}): Promise<Supplier> => {
  if (!forceNew && supplier) {
    return supplier;
  }

  const created = await models.Suppliers.create({
    name: `Name - ${faker.company.companyName()}`,
    alias: `Alias - ${faker.company.companyName()}`,
    street: 'street',
    street_number: '123123',
    city: 'City',
    zipcode: '123',
    country: 'AR',
    email: faker.internet.email().toLowerCase(),
    phone: '123123123',
    number: '0000',
    active: true,
    ...data,
  });

  if (forceNew) {
    return created.toJSON();
  }

  supplier = created.toJSON();

  return supplier;
};

export const setUserHolding = async (user, holding): Promise<void> => {
  await models.Users.update({
    holding_id: holding.id,
  }, {
    where: {
      id: user.id,
    },
  });
}

export const setUserSupplier = async (user, supplier): Promise<void> => {
  await models.Users.update({
    supplier_id: supplier.id,
  }, {
    where: {
      id: user.id,
    },
  });
};

export const createUser = async (data = {}): Promise<{ user: User, token: string }> => {
  console.log('create user->', data)
  const user = await models.Users.create({
    name: faker.name.firstName(),
    surname: faker.name.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: 'testtest',
    ...data,
  });

  const json = user.toJSON();
  const token = UsersLogic.getJWT(json);

  return {user: json, token};
};

export const createTransportAgent = async (data = {}): Promise<TransportAgent> => {
  if (transportAgent) {
    return transportAgent;
  }

  const created = await models.TransportAgents.create({
    name: `Name - ${faker.company.companyName()}`,
    alias: `Alias - ${faker.company.companyName()}`,
    street: 'street',
    street_number: '123123',
    city: 'City',
    country: 'AR',
  });

  transportAgent = created.toJSON();

  return transportAgent;
};

export const createTour = async (holding: Holding, supplier: Supplier, transportAgent: TransportAgent): Promise<Tour> => {
  const created = await models.Tours.create({
    holding_id: holding.id,
    supplier_id: supplier.id,
    transport_agent_id: transportAgent.id,
    name: `Tour: ${faker.company.companyName()}`,
    description: 'this is the tour 1',
    number: '0000',
    active: true,
  });

  return created.toJSON();
};

export const createCustomer = async (holding: Holding, supplier: Supplier, tour: Tour, data = {}): Promise<Customer> => {
  const created = await models.Customers.create({
    holding_id: holding.id,
    supplier_id: supplier.id,
    tour_id: tour.id,
    tour_position: 1,
    name: faker.company.companyName(),
    alias: faker.company.companyName(),
    street: 'st',
    street_number: '123123',
    city: 'City 2',
    zipcode: '123',
    country: 'BR',
    contact_salutation: 'MR',
    contact_name: 'John',
    contact_surname: 'Doe',
    email: faker.internet.email().toLowerCase(),
    phone: '123321312312',
    sms_notifications: false,
    email_notifications: false,
    active: true,
    coordinates: {
      type: 'Point',
      coordinates: [11.000001, 4.14001],
    },
    ...data,
  });

  return created.toJSON();
};

export const createOrder = async (holding: Holding, supplier: Supplier, customer: Customer, data = {}): Promise<Order> => {
  const created = await models.Orders.create({
    holding_id: holding.id,
    customer_id: customer.id,
    supplier_id: supplier.id,
    description: 'This is the order description for ' + customer.name,
    number: '0000',
    ...data,
  });

  return created.toJSON();
};

export const createRoute = async (
  user: User, holding: Holding, supplier: Supplier, _customers: number[]
): Promise<{
  route: Route;
  transportAgent: TransportAgent;
  tour: Tour;
  customers: { customer: Customer; orders: Order[] }[];
  token: string;
}> => {
  const transportAgent = await createTransportAgent();
  const tour = await createTour(holding, supplier, transportAgent);
  const order_ids = [];
  let i = 0;
  const customers = [];

  while (i < _customers.length) {
    const customer = await createCustomer(holding, supplier, tour, {tour_position: i});
    let j = 0;
    let orders = [];

    while (j < _customers[i]) {
      const order = await createOrder(holding, supplier, customer);

      orders.push(order);
      order_ids.push(order.id);

      j += 1;
    }

    customers.push({customer, orders});

    i += 1;
  }

  const route = await RoutesLogic.create({order_ids, tour_id: tour.id}, user);
  const token = UsersLogic.getDriverJWT(route);

  await models.Routes.update({active_driver_jwt: token}, {
    where: {id: route.id},
  });

  return {
    route,
    transportAgent,
    tour,
    customers,
    token,
  };
};

export default {
  request,
  delay,
  createUser,
  createHolding,
  createSupplier,
  setUserSupplier,
  setUserHolding,
  createTransportAgent,
  createTour,
  createCustomer,
  createOrder,
  createRoute,
};
