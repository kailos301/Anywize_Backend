import 'mocha';
import { expect } from 'chai';
import Helper from './_helper';
import models from '../models';

const { request } = Helper;

describe('Orders tests', () => {
  let holding: Holding;
  let supplier: Supplier;
  let tour: Tour;
  let transportAgent: TransportAgent;
  let supplierTwo: Supplier;
  let holdingTwo: Holding;
  let tourTwo: Tour;
  let transportAgentTwo: TransportAgent;

  before(async () => {
    holding = await Helper.createHolding();
    supplier = await Helper.createSupplier();
    transportAgent = await Helper.createTransportAgent();
    tour = await Helper.createTour(holding, supplier, transportAgent);

    supplierTwo = await Helper.createSupplier(true);
    holdingTwo = await Helper.createHolding(true);
    transportAgentTwo = await Helper.createTransportAgent();
    tourTwo = await Helper.createTour(holdingTwo, supplierTwo, transportAgentTwo);
  });

  it('/api/orders/* should return 401 if not logged in', async () => {
    let res = await request.get('/api/orders');
    expect(res.status).equal(401);

    res = await request.get('/api/orders/1');
    expect(res.status).equal(401);

    res = await request.post('/api/orders');
    expect(res.status).equal(401);

    res = await request.put('/api/orders/1');
    expect(res.status).equal(401);

    res = await request.delete('/api/orders/1');
    expect(res.status).equal(401);
  });

  it('/api/orders/* should return 403 if user has no supplier_id', async () => {
    const { token } = await Helper.createUser();

    let res = await request.get('/api/orders').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(403);

    res = await request.get('/api/orders/1').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(403);

    res = await request.post('/api/orders').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(403);

    res = await request.put('/api/orders/1').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(403);

    res = await request.delete('/api/orders/1').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(403);
  });

  it('POST /api/orders should create an order', async () => {
    const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const customer = await Helper.createCustomer(holding, supplier, tour);
    const customerTwo = await Helper.createCustomer(holdingTwo, supplierTwo, tourTwo);

    let res = await request
      .post('/api/orders')
      .send({})
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.errors).eql({
      customer_id: '"customer_id" is required',
      description: '"description" is required',
    });

    // client from another supplier should return error
    res = await request
      .post('/api/orders')
      .send({
        customer_id: customerTwo.id,
        description: 'test',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.error).equal('INVALID_CUSTOMER');

    res = await request
      .post('/api/orders')
      .send({
        customer_id: customer.id,
        description: 'test',
        number: 'something',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.customer_id).equal(customer.id);
    expect(res.body.description).equal('test');
    expect(res.body.number).equal('something');
  });

  it('PUT /api/orders/:id should update an order', async () => {
    const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const customer = await Helper.createCustomer(holding, supplier, tour);
    const customerTwo = await Helper.createCustomer(holdingTwo, supplierTwo, tourTwo);
    const order = await Helper.createOrder(holding, supplier, customer);

    let res = await request
      .put(`/api/orders/${order.id}`)
      .send({})
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.errors).eql({
      customer_id: '"customer_id" is required',
      description: '"description" is required',
    });

    // invalid order number
    res = await request
      .put(`/api/orders/9999`)
      .send({
        customer_id: customer.id,
        description: 'blabla',
        number: '22222222222',
      })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(404);

    // customer from another supplier
    res = await request
      .put(`/api/orders/${order.id}`)
      .send({
        customer_id: customerTwo.id,
        description: 'blabla',
        number: '22222222222',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.error).equal('INVALID_CUSTOMER');

    // ok
    res = await request
      .put(`/api/orders/${order.id}`)
      .send({
        customer_id: customer.id,
        description: 'blabla',
        number: '22222222222',})
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.description).equal('blabla');
    expect(res.body.number).equal('22222222222');

    // order already inside route
    const route = await models.Routes.create({
      tour_id: tour.id,
      route: [],
      code: 'bla',
      password: 'bla',
    });
    await models.Orders.update({
      route_id: route.id,
    }, {
      where: { id: order.id },
    });

    res = await request
      .put(`/api/orders/${order.id}`)
      .send({
        customer_id: customer.id,
        description: 'blabla',
        number: '22222222222',})
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.error).equal('ORDER_ALREADY_IN_ROUTE');
  });

  it('GET /api/orders should return a list of orders', async () => {
    const { token, user } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const customer = await Helper.createCustomer(holding, supplier, tour);
    const order = await Helper.createOrder(holding, supplier, customer);

    let res = await request
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body[0].id).equal(order.id);

    res = await request
      .get('/api/orders?limit=1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.length).equal(1);
    expect(res.headers['x-total-count']).not.to.be.equal(null);

    res = await request
      .get(`/api/orders?customer_id=${customer.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    res.body.forEach((o) => expect(o.customer_id).equal(customer.id));
    expect(res.body[0].Customer.id).equal(customer.id);

    const { route } = await Helper.createRoute(user, holding, supplier, [2]);

    res = await request
      .get('/api/orders?assigned_to_route=1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    res.body.forEach((o) => expect(o.route_id).to.be.a('number'));
    expect(res.body[0].route_id).equal(route.id);
    expect(res.body[1].route_id).equal(route.id);

    res = await request
      .get('/api/orders?assigned_to_route=0')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    res.body.forEach((o) => expect(o.route_id).equal(null));
  });

  it('GET /api/orders/:id should return a single order', async () => {
    const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const customer = await Helper.createCustomer(holding, supplier, tour);
    const order = await Helper.createOrder(holding, supplier, customer);

    let res = await request
      .get('/api/orders/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(404);

    res = await request
      .get(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body).to.have.property('supplier_id');
    expect(res.body).to.have.property('customer_id');
    expect(res.body).to.have.property('route_id');
    expect(res.body).to.have.property('description');
    expect(res.body).to.have.property('delivered_at');
    expect(res.body).to.have.property('number');
    expect(res.body.Customer).eql({
      id: customer.id,
      tour_id: customer.tour_id,
      tour_position: customer.tour_position,
      name: customer.name,
      alias: customer.alias,
      street: customer.street,
      street_number: customer.street_number,
      city: customer.city,
      zipcode: customer.zipcode,
      country: customer.country,
      email: customer.email,
      phone: customer.phone,
      Tour: {
        id: tour.id,
        name: tour.name,
      },
    });
  });

  it('DELETE /api/orders/:id should delete an order', async () => {
    const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const customer = await Helper.createCustomer(holding, supplier, tour);
    const order = await Helper.createOrder(holding, supplier, customer);

    // order already inside route
    const route = await models.Routes.create({
      tour_id: tour.id,
      route: [],
      code: 'bla',
      password: 'bla',
    });
    await models.Orders.update({
      route_id: route.id,
    }, {
      where: { id: order.id },
    });

    let res = await request
      .delete(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.error).equal('ORDER_ALREADY_IN_ROUTE');

    await models.Orders.update({
      route_id: null,
    }, {
      where: { id: order.id },
    });

    res = await request
      .delete(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(200);

    res = await request
      .get(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(404);
  });
});
