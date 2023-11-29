import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import Helper from './_helper';
import models from '../models';
import S3Logic from '../logic/s3';
import EmailsLogic from '../logic/emails';
import RoutesCustomersOrdering from '../logic/routes-customers-ordering';
import { DateTime } from 'luxon';

const { request } = Helper;

describe('Drivers tests', () => {
  let supplier: Supplier;
  let holding: Holding;

  before(async () => {
    supplier = await Helper.createSupplier();
    holding = await Helper.createHolding();
  });

  it('/api/drivers/* should return 401 if not logged in', async () => {
    let res = await request.get('/api/drivers/route');
    expect(res.status).equal(401);

    res = await request.put('/api/drivers/route');
    expect(res.status).equal(401);

    res = await request.put('/api/drivers/route/start');
    expect(res.status).equal(401);

    res = await request.put('/api/drivers/route/end');
    expect(res.status).equal(401);

    res = await request.post('/api/drivers/route/stop');
    expect(res.status).equal(401);

    res = await request.post('/api/drivers/route/location');
    expect(res.status).equal(401);

    res = await request.post('/api/drivers/route/navigation');
    expect(res.status).equal(401);
  });

  it('/api/drivers/* should return 401 if using a regular auth token', async () => {
    const { token } = await Helper.createUser();

    let res = await request.get('/api/drivers/route').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(401);

    res = await request.put('/api/drivers/route').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(401);

    res = await request.put('/api/drivers/route/start').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(401);

    res = await request.put('/api/drivers/route/end').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(401);

    res = await request.post('/api/drivers/route/stop').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(401);

    res = await request.post('/api/drivers/route/location').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(401);

    res = await request.post('/api/drivers/route/navigation').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(401);
  });

  it('POST /api/drivers/login should login using code/password from a route', async () => {
    const { user } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const { route } = await Helper.createRoute(user, holding, supplier, [1, 3]);
    const { code, password } = route;

    let res = await request
      .post('/api/drivers/login')
      .send({});

    expect(res.status).equal(400);
    expect(res.body.errors).eql({
      code: '"code" is required',
      password: '"password" is required',
    });

    res = await request
      .post('/api/drivers/login')
      .send({
        code: 'n',
        password: 'mm',
      });

    expect(res.status).equal(400);
    expect(res.body.error).equal('INVALID_AUTH_OR_ROUTE');

    res = await request
      .post('/api/drivers/login')
      .send({ code, password });

    expect(res.status).equal(200);
    expect(res.body.token).to.be.a('string');

    await models.Routes.update({
      start_date: new Date(),
      end_date: new Date(),
    }, {
      where: { id: route.id },
    });

    // route that ended should no longer allow login
    res = await request
      .post('/api/drivers/login')
      .send({ code, password });

    expect(res.status).equal(400);
    expect(res.body.error).equal('INVALID_AUTH_OR_ROUTE');
  });

  it('POST /api/drivers/login should invalidate the previous login', async () => {
    const { user } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const { route } = await Helper.createRoute(user, holding, supplier, [1, 3]);
    const { code, password } = route;

    let res = await request
      .post('/api/drivers/login')
      .send({ code, password });

    expect(res.status).equal(200);
    expect(res.body.token).to.be.a('string');

    const { token } = res.body;

    let r = await models.Routes.findByPk(route.id);
    expect(r.active_driver_jwt).equal(token);

    res = await request
      .post('/api/drivers/login')
      .send({ code, password });

    expect(res.status).equal(200);
    expect(res.body.token).to.be.a('string');

    const newToken = res.body.token;
    expect(newToken).not.to.be.equal(token);

    r = await models.Routes.findByPk(route.id);
    expect(r.active_driver_jwt).equal(newToken);

    // trying to use old token should return error
    res = await request
      .get('/api/drivers/route')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(401);

    // new token should work
    res = await request
      .get('/api/drivers/route')
      .set('Authorization', `Bearer ${newToken}`);

    expect(res.status).equal(200);
  });

  it('GET /api/drivers/route should return a route', async () => {
    const { user } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const {
      route,
      token,
      customers,
      tour: newTour,
      transportAgent: newTransportAgent,
    } = await Helper.createRoute(user, holding, supplier, [3]);

    let res = await request
      .get('/api/drivers/route')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.pathway[0]).eql({
      latitude: customers[0].customer.coordinates.coordinates[1],
      longitude: customers[0].customer.coordinates.coordinates[0],
      id: customers[0].customer.id,
      tour_id: customers[0].customer.tour_id,
      tour_position: customers[0].customer.tour_position,
      name: customers[0].customer.name,
      number: customers[0].customer.number || null,
      alias: customers[0].customer.alias,
      street: customers[0].customer.street,
      street_number: customers[0].customer.street_number,
      city: customers[0].customer.city,
      zipcode: customers[0].customer.zipcode,
      country: customers[0].customer.country,
      coordinates: customers[0].customer.coordinates,
      email: customers[0].customer.email,
      contact_name: customers[0].customer.contact_name,
      contact_surname: customers[0].customer.contact_surname,
      contact_salutation: customers[0].customer.contact_salutation,
      phone: customers[0].customer.phone,
      deposit_agreement: customers[0].customer.deposit_agreement,
      keybox_code: customers[0].customer.keybox_code || null,
      Orders: [
        {
          id: customers[0].orders[0].id,
          supplier_id: customers[0].orders[0].supplier_id,
          customer_id: customers[0].orders[0].customer_id,
          description: customers[0].orders[0].description,
          number: customers[0].orders[0].number,
          delivered_at: null,
        },
        {
          id: customers[0].orders[1].id,
          supplier_id: customers[0].orders[1].supplier_id,
          customer_id: customers[0].orders[1].customer_id,
          description: customers[0].orders[1].description,
          number: customers[0].orders[1].number,
          delivered_at: null,
        },
        {
          id: customers[0].orders[2].id,
          supplier_id: customers[0].orders[2].supplier_id,
          customer_id: customers[0].orders[2].customer_id,
          description: customers[0].orders[2].description,
          number: customers[0].orders[2].number,
          delivered_at: null,
        },
      ],
    });
    expect(res.body.id).equal(route.id);
    expect(res.body.Tour.id).equal(newTour.id);
    expect(res.body.Tour.TransportAgent.id).equal(newTransportAgent.id);
    expect(res.body.Tour.Supplier.id).equal(supplier.id);

    const { pathway } = await models.Routes.findByPk(route.id, { raw: true });

    pathway[0].skipped_at = DateTime.now().toISO();

    await models.Routes.update({
      pathway,
    }, {
      where: { id: route.id },
    });

    res = await request
      .get('/api/drivers/route')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.pathway).eql(null);
  });

  it('PUT /api/drivers/route should set the driver name and phone to the route', async () => {
    const { user } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const {
      route,
      token,
    } = await Helper.createRoute(user, holding, supplier, [3]);

    let res = await request
      .put('/api/drivers/route')
      .send({})
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.errors).eql({
      driver_name: '"driver_name" is required',
      driver_phone: '"driver_phone" is required',
    });

    res = await request
      .put('/api/drivers/route')
      .send({
        driver_name: 'John',
        driver_phone: '123123123',
      })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(200);

    const r = await models.Routes.findByPk(route.id);
    expect(r.driver_name).equal('John');
    expect(r.driver_phone).equal('123123123');
  });

  it('PUT /api/drivers/route/start should mark a route as started', async () => {
    const { user } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const {
      route,
      token,
      customers,
    } = await Helper.createRoute(user, holding, supplier, [3, 1]);

    await models.Customers.update({
      email_notifications: true,
    }, {
      where: { id: customers[1].customer.id },
    });

    const spy = sinon.spy(EmailsLogic, 'notifyRouteStarted');

    let res = await request
      .put('/api/drivers/route/start')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);

    const v1 = await models.Routes.findByPk(route.id);
    expect(v1.start_date).not.to.be.equal(null);

    // second request should not matter
    res = await request
      .put('/api/drivers/route/start')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    const v2 = await models.Routes.findByPk(route.id);
    expect(DateTime.fromISO(v2.start_date).toFormat('DDDD')).equal(DateTime.fromISO(v1.start_date).toFormat('DDDD'));

    expect(spy.callCount).equal(1);
    expect(spy.args[0][0].id).equal(customers[1].customer.id);
    expect(spy.args[0][1].id).equal(supplier.id);

    spy.restore();
  });

  it('PUT /api/drivers/route/end should mark a route as ended', async () => {
    const { user } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const {
      route,
      token,
    } = await Helper.createRoute(user, holding, supplier, [3]);

    let res = await request
      .put('/api/drivers/route/end')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(404);

    await models.Routes.update({
      start_date: new Date(),
    }, {
      where: { id: route.id },
    });

    res = await request
      .put('/api/drivers/route/end')
      .set('Authorization', `Bearer ${token}`);

    const v1 = await models.Routes.findByPk(route.id);
    expect(v1.end_date).not.to.be.equal(null);

    // second request should fail
    res = await request
      .put('/api/drivers/route/start')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(401);
  });

  it('POST /api/drivers/route/location should save the current location', async () => {
    const { user } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const {
      route,
      token,
    } = await Helper.createRoute(user, holding, supplier, [3]);

    let res = await request
      .post('/api/drivers/route/location')
      .send({})
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);

    res = await request
      .post('/api/drivers/route/location')
      .send({
        longitude: 10.123123,
        latitude: 9.2,
      })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(200);

    res = await request
      .post('/api/drivers/route/location')
      .send([{
        longitude: 10.123123,
        latitude: 9.2,
        created_at: '2021-01-01T10:00:00',
      }])
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(200);

    const locs = await models.DriversLocations.findAll({
      where: { route_id: route.id },
      raw: true,
    });
    expect(locs.length).equal(2);
  });

  it('POST /api/drivers/route/navigation should save the proposed navigation', async () => {
    const { user } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const {
      route,
      token,
      customers,
    } = await Helper.createRoute(user, holding, supplier, [3]);

    let res = await request
      .post('/api/drivers/route/navigation')
      .send({})
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.errors).eql({
      customer_id: '"customer_id" is required',
      navigation: '"navigation" is required',
    });

    res = await request
      .post('/api/drivers/route/navigation')
      .send({
        customer_id: customers[0].customer.id,
        navigation: {
          a: 1,
          routes: [],
          b: { a: 1, b: 2, c: 2},
          c: [],
        },
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);

    const navs = await models.RoutesNavigations.findAll({
      where: { route_id: route.id },
      raw: true,
    });
    expect(navs.length).equal(1);
    expect(navs[0].navigation).eql({
      a: 1,
      b: { a: 1, b: 2, c: 2},
      c: [],
      routes: [],
    });
  });

  it('POST /api/drivers/route/stop should create a stop, mark the route section as started and return the next pathway', async () => {
    const { user } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const orderSpy = sinon.stub(RoutesCustomersOrdering, 'solveWithMatrix').callsFake(() => []);
    const {
      route,
      token,
      customers,
    } = await Helper.createRoute(user, holding, supplier, [3, 1, 1]);

    let res = await request
      .put('/api/drivers/route/start')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);

    res = await request
      .get('/api/drivers/route')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(200);

    expect(res.body.pathway[0].id).equal(customers[0].customer.id);

    let spy = sinon.stub(S3Logic, 'processStopFiles').callsFake(() => ['signature.png', []]);

    res = await request
      .post('/api/drivers/route/stop')
      .attach('signature', `${process.cwd()}/src/tests/data/c.jpeg`)
      .field('customer_id', customers[0].customer.id)
      .field('time', (new Date()).toISOString())
      .field('customer_signed', true)
      .field('latitude', 10)
      .field('longitude', 11)
      .field('meet_customer', true)
      .field('driver_name', 'John')
      .field('driver_phone', '12312312312312')
      .field('goods_back', '0')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.pathway.length).equal(3);
    expect(res.body.pathway[0].goods_back).equal(false);
    expect(res.body.current_pathway_index).equal(1);
    expect(res.body.pathway[res.body.current_pathway_index].id).equal(customers[1].customer.id);
    expect(res.body.pathway[res.body.current_pathway_index].Orders.length).equal(1);

    expect(spy.callCount).equal(1);
    spy.restore();

    // orders from the first customer should be delivered
    let orders = await models.Orders.findAll({
      where: {
        customer_id: customers[0].customer.id,
      },
      raw: true,
    });
    expect(orders.length).equal(3);
    orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));

    let dbRoute = await models.Routes.findByPk(route.id);
    expect(dbRoute.pathway[0].id).equal(customers[0].customer.id);
    dbRoute.pathway[0].Orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));
    dbRoute.pathway[1].Orders.forEach((o) => expect(o.delivered_at).equal(null));
    dbRoute.pathway[2].Orders.forEach((o) => expect(o.delivered_at).equal(null));

    // second stop
    spy = sinon.stub(S3Logic, 'processStopFiles').callsFake(() => ['signature.png', ['one.jpg']]);
    res = await request
      .post('/api/drivers/route/stop')
      .field('customer_id', customers[1].customer.id)
      .field('time', (new Date()).toISOString())
      .field('customer_signed', true)
      .field('latitude', 10)
      .field('longitude', 11)
      .field('meet_customer', true)
      .field('driver_name', 'John')
      .field('driver_phone', '12312312312')
      .field('goods_back', false)
      .attach('signature', `${process.cwd()}/src/tests/data/c.jpeg`)
      .attach('pictures', `${process.cwd()}/src/tests/data/c.jpeg`)
      .attach('pictures', `${process.cwd()}/src/tests/data/c.jpeg`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.pathway.length).equal(3);
    expect(res.body.current_pathway_index).equal(2);
    expect(res.body.pathway[res.body.current_pathway_index].id).equal(customers[2].customer.id);
    expect(res.body.pathway[res.body.current_pathway_index].Orders.length).equal(1);

    // orders from the second customer should be delivered
    orders = await models.Orders.findAll({
      where: {
        customer_id: customers[1].customer.id,
      },
      raw: true,
    });
    expect(orders.length).equal(1);
    orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));

    dbRoute = await models.Routes.findByPk(route.id);
    expect(dbRoute.pathway[0].id).equal(customers[0].customer.id);
    dbRoute.pathway[0].Orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));
    dbRoute.pathway[1].Orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));
    dbRoute.pathway[2].Orders.forEach((o) => expect(o.delivered_at).equal(null));

    // third stop
    res = await request
      .post('/api/drivers/route/stop')
      .send({
        customer_id: customers[2].customer.id,
        time: (new Date()).toISOString(),
        customer_signed: true,
        latitude: 10,
        longitude: 11,
        meet_customer: true,
        reason: null,
        driver_name: 'John',
        driver_phone: '123123123',
        goods_back: true,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.pathway).equal(null);

    // orders from the third customer should be delivered
    orders = await models.Orders.findAll({
      where: {
        customer_id: customers[2].customer.id,
      },
      raw: true,
    });
    expect(orders.length).equal(1);
    orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));

    dbRoute = await models.Routes.findByPk(route.id);
    expect(dbRoute.pathway[0].id).equal(customers[0].customer.id);
    expect(dbRoute.pathway[2].goods_back).equal(true);
    dbRoute.pathway[0].Orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));
    dbRoute.pathway[1].Orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));
    dbRoute.pathway[2].Orders.forEach((o) => expect(o.delivered_at).not.to.be.equal(null));

    spy.restore();
    orderSpy.restore();
  });
});
