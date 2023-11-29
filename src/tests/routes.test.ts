import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { DateTime } from 'luxon';
import Helper from './_helper';
import models from '../models';
import RoutesCustomersOrdering from '../logic/routes-customers-ordering';

const { request } = Helper;

describe('Routes tests', () => {
  let holding: Holding;
  let supplier: Supplier;
  let tour: Tour;
  let transportAgent: TransportAgent;

  before(async () => {
    holding = await Helper.createHolding();
    supplier = await Helper.createSupplier();
    transportAgent = await Helper.createTransportAgent();
    tour = await Helper.createTour(holding, supplier, transportAgent);
  });

  it('/api/routes/* should return 401 if not logged in', async () => {
    let res = await request.get('/api/routes');
    expect(res.status).equal(401);

    res = await request.get('/api/routes/1');
    expect(res.status).equal(401);

    res = await request.post('/api/routes');
    expect(res.status).equal(401);

    res = await request.delete('/api/routes/1');
    expect(res.status).equal(401);
  });

  it('/api/routes/* should return 403 if user has no supplier_id', async () => {
    const { token } = await Helper.createUser();

    let res = await request.get('/api/routes').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(403);

    res = await request.get('/api/routes/1').set('Authorization', `Bearer ${token}`);;
    expect(res.status).equal(403);

    res = await request.post('/api/routes').set('Authorization', `Bearer ${token}`);;
    expect(res.status).equal(403);

    res = await request.delete('/api/routes/1').set('Authorization', `Bearer ${token}`);;
    expect(res.status).equal(403);

    res = await request.put('/api/routes/skip-stop/1/1').set('Authorization', `Bearer ${token}`);;
    expect(res.status).equal(403);
  });

  it('POST /api/routes should create a new route', async () => {
    const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const customer = await Helper.createCustomer(holding, supplier, tour, { tour_position: 3 });
    const order = await Helper.createOrder(holding, supplier, customer);
    const customerTwo = await Helper.createCustomer(holding, supplier, tour, { tour_position: 4 });
    const orderTwo = await Helper.createOrder(holding, supplier, customerTwo);
    const orderThree = await Helper.createOrder(holding, supplier, customerTwo);
    const customerThree = await Helper.createCustomer(holding, supplier, tour, { tour_position: 1 });
    const orderFour = await Helper.createOrder(holding, supplier, customerThree);

    let spy = sinon.stub(RoutesCustomersOrdering, 'solveWithMatrix').callsFake(() => [{ id: customer.id }]);

    let res = await request
      .post('/api/routes')
      .send({})
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.errors).eql({
      order_ids: '"order_ids" is required',
      tour_id: '"tour_id" is required',
    });

    res = await request
      .post('/api/routes')
      .send({
        order_ids: [999],
        tour_id: 2,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.error).equal('INVALID_ORDERS');

    res = await request
      .post('/api/routes')
      .send({
        order_ids: [order.id],
        tour_id: tour.id,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('uuid');
    expect(res.body).to.have.property('pathway');
    expect(res.body).to.have.property('tour_id');
    expect(res.body).to.have.property('code');
    expect(res.body).to.have.property('password');

    expect(res.body.pathway).eql([{
      latitude: customer.coordinates.coordinates[1],
      longitude: customer.coordinates.coordinates[0],
      id: customer.id,
      tour_id: customer.tour_id,
      tour_position: customer.tour_position,
      name: customer.name,
      number: customer.number || null,
      alias: customer.alias,
      street: customer.street,
      street_number: customer.street_number,
      city: customer.city,
      contact_name: customer.contact_name,
      contact_surname: customer.contact_surname,
      contact_salutation: customer.contact_salutation,
      zipcode: customer.zipcode,
      country: customer.country,
      coordinates: customer.coordinates,
      email: customer.email,
      phone: customer.phone,
      deposit_agreement: customer.deposit_agreement,
      keybox_code: customer.keybox_code || null,
      Orders: [
        {
          id: order.id,
          supplier_id: order.supplier_id,
          customer_id: order.customer_id,
          description: order.description,
          number: order.number,
          delivered_at: null,
        },
      ],
    }]);

    expect(spy.callCount).equal(1);
    spy.restore();

    // two customers with 3 orders total
    spy = sinon.stub(RoutesCustomersOrdering, 'solveWithMatrix').callsFake(() => [{ id: customerThree.id }, { id: customerTwo.id }]);
    res = await request
      .post('/api/routes')
      .send({
        order_ids: [order.id, orderTwo.id, orderFour.id, orderThree.id],
        tour_id: tour.id,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.pathway.length).equal(2);
    expect(res.body.pathway[0]).eql({
      latitude: customerThree.coordinates.coordinates[1],
      longitude: customerThree.coordinates.coordinates[0],
      id: customerThree.id,
      tour_id: customerThree.tour_id,
      tour_position: customerThree.tour_position,
      name: customerThree.name,
      number: customerThree.number,
      alias: customerThree.alias,
      street: customerThree.street,
      street_number: customerThree.street_number,
      city: customerThree.city,
      zipcode: customerThree.zipcode,
      country: customerThree.country,
      coordinates: customerThree.coordinates,
      contact_name: customerThree.contact_name,
      contact_surname: customerThree.contact_surname,
      contact_salutation: customerThree.contact_salutation,
      email: customerThree.email,
      phone: customerThree.phone,
      deposit_agreement: customerThree.deposit_agreement,
      keybox_code: customerThree.keybox_code || null,
      Orders: [
        {
          id: orderFour.id,
          supplier_id: orderFour.supplier_id,
          customer_id: orderFour.customer_id,
          description: orderFour.description,
          number: orderFour.number,
          delivered_at: null,
        },
      ],
    });
    expect(res.body.pathway[1]).eql({
      latitude: customerTwo.coordinates.coordinates[1],
      longitude: customerTwo.coordinates.coordinates[0],
      id: customerTwo.id,
      tour_id: customerTwo.tour_id,
      tour_position: customerTwo.tour_position,
      name: customerTwo.name,
      number: customerTwo.number,
      alias: customerTwo.alias,
      street: customerTwo.street,
      street_number: customerTwo.street_number,
      city: customerTwo.city,
      zipcode: customerTwo.zipcode,
      country: customerTwo.country,
      coordinates: customerTwo.coordinates,
      contact_name: customerTwo.contact_name,
      contact_surname: customerTwo.contact_surname,
      contact_salutation: customerTwo.contact_salutation,
      email: customerTwo.email,
      phone: customerTwo.phone,
      deposit_agreement: customerTwo.deposit_agreement,
      keybox_code: customerTwo.keybox_code || null,
      Orders: [{
        id: orderTwo.id,
        supplier_id: orderTwo.supplier_id,
        customer_id: orderTwo.customer_id,
        description: orderTwo.description,
        number: orderTwo.number,
        delivered_at: null,
      }, {
        id: orderThree.id,
        supplier_id: orderThree.supplier_id,
        customer_id: orderThree.customer_id,
        description: orderThree.description,
        number: orderThree.number,
        delivered_at: null,
      }],
    });

    // trying again, when orders are assigned, should return error
    res = await request
      .post('/api/routes')
      .send({
        order_ids: [order.id, orderTwo.id, orderFour.id, orderThree.id],
        tour_id: tour.id,
      })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(400);
    expect(res.body.error).equal('INVALID_ORDERS');

    const orders = await models.Orders.findAll({
      where: {
        id: [order.id, orderTwo.id, orderThree.id, orderFour.id],
      },
      raw: true,
    });
    orders.forEach((o) => expect(o.route_id).not.to.be.equal(null));
  });

  it('GET /api/routes should return a list of routes', async () => {
    const { token, user } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const { route } = await Helper.createRoute(user, holding, supplier, [1, 1, 1]);

    let res = await request
      .get('/api/routes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body[0].id).equal(route.id);
    expect(res.body[0].Tour).to.be.an('object');

    res = await request
      .get('/api/routes?limit=1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.length).equal(1);
    expect(res.body[0].id).equal(route.id);

    res = await request
      .get('/api/routes?started=0')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body[0].id).equal(route.id);


    res = await request
      .get('/api/routes?started=1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body[0]?.id).not.to.be.equal(route.id);

    await models.Routes.update({ start_date: DateTime.now().minus({ days: 1 })}, {
      where: { id: route.id },
    });

    res = await request
      .get('/api/routes?started=1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body[0].id).equal(route.id);

    res = await request
      .get(`/api/routes?start_date_from=${DateTime.now().minus({ days: 2 })}&start_date_to=${DateTime.now().plus({ days: 1 })}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body[0].id).equal(route.id);
  });

  it('GET /api/routes/:id should return a route', async () => {
    const { token, user } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const { route, tour: newTour, transportAgent: newTransportAgent } = await Helper.createRoute(user, holding, supplier, [1, 1, 1]);

    let res = await request
      .get('/api/routes/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(404);

    res = await request
      .get(`/api/routes/${route.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.id).equal(route.id);
    expect(res.body.Stops).to.be.an('array');
    expect(res.body.DriversLocations).to.be.an('array');
    expect(res.body.Orders.length).equal(3);
    expect(res.body.Tour.id).equal(newTour.id);
    expect(res.body.Tour.TransportAgent.id).equal(newTransportAgent.id);
  });

  it('PUT /api/routes/skip-stop/:id/:customer_id should mark a pathway item as skipped', async () => {
    const { token, user } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const { route, tour: newTour, transportAgent: newTransportAgent } = await Helper.createRoute(user, holding, supplier, [1, 1, 1]);

    let res = await request
      .put('/api/routes/skip-stop/99999/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(404);

    res = await request
      .put(`/api/routes/skip-stop/${route.id}/99999`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);

    res = await request
      .put(`/api/routes/skip-stop/${route.id}/${route.pathway[1].id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);

    let r = await models.Routes.findByPk(route.id);
    expect(r.pathway[0].skipped_at).equal(undefined);
    expect(r.pathway[1].skipped_at).to.be.a('string');
    expect(r.pathway[2].skipped_at).equal(undefined);

    res = await request
      .put(`/api/routes/skip-stop/${route.id}/${route.pathway[0].id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);

    r = await models.Routes.findByPk(route.id);
    expect(r.pathway[0].skipped_at).to.be.a('string');
    expect(r.pathway[1].skipped_at).to.be.a('string');
    expect(r.pathway[2].skipped_at).equal(undefined);
  });

  it('DELETE /api/routes/:id should delete a route when its not started', async () => {
    const { token, user } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const { route, customers } = await Helper.createRoute(user, holding, supplier, [3, 4]);

    await models.Routes.update({
      start_date: new Date(),
    }, {
      where: { id: route.id },
    });

    let res = await request
      .delete(`/api/routes/${route.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.error).equal('ROUTE_STARTED');

    await models.Routes.update({
      start_date: null,
    }, {
      where: { id: route.id },
    });

    res = await request
      .delete(`/api/routes/${route.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(200);

    const count = await models.Routes.count({
      where: { id: route.id },
    });
    expect(count).equal(0);

    const orders = await models.Orders.findAll({
      where: {
        id: customers.reduce((acc, item) => {
          return acc.concat(item.orders.map((o) => o.id));
        }, []),
      },
    });

    expect(orders.length).equal(7);
    orders.forEach((order) => expect(order.route_id).equal(null));
  });
});
