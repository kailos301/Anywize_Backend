import 'mocha';
import { expect } from 'chai';
import Helper from './_helper';
import models from '../models';

const { request } = Helper;

describe('Customers tests', () => {
  let holding: Holding;
  let supplier: Supplier;
  let transportAgent: TransportAgent;
  let tour: Tour;

  before(async () => {
    holding = await Helper.createHolding();
    supplier = await Helper.createSupplier();
    transportAgent = await Helper.createTransportAgent();
    tour = await Helper.createTour(holding, supplier, transportAgent);
  });

  it('/api/customers/* should return 401 when not logged in', async () => {
    let res = await request.post('/api/customers');
    expect(res.status).equal(401);

    res = await request.put('/api/customers/1');
    expect(res.status).equal(401);

    res = await request.get('/api/customers');
    expect(res.status).equal(401);

    res = await request.get('/api/customers/1');
    expect(res.status).equal(401);

    res = await request.delete('/api/customers/1');
    expect(res.status).equal(401);
  });

  it('/api/customers/* should return 403 when user has no supplier_id set', async () => {
    const { token } = await Helper.createUser();

    let res = await request.post('/api/customers').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(403);

    res = await request.put('/api/customers/1').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(403);

    res = await request.get('/api/customers').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(403);

    res = await request.get('/api/customers/1').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(403);
  });

  it('POST /api/customers should create a customer', async () => {
    const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    // console.log('test start->', token)

    let res = await request
      .post('/api/customers')
      .send({})
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.errors).eql({
      deposit_agreement: '"deposit_agreement\" is required',
      tour_id: '"tour_id" is required',
      tour_position: '"tour_position" is required',
      name: '"name" is required',
      alias: '"alias" is required',
      street: '"street" is required',
      street_number: '"street_number" is required',
      city: '"city" is required',
      zipcode: '"zipcode" is required',
      country: '"country" is required',
      email: '"email" is required',
      phone: '"phone" is required',
      latitude: '"latitude" is required',
      longitude: '"longitude" is required',
    });

    res = await request
      .post('/api/customers')
      .send({
        tour_id: 999,
        tour_position: 1,
        name: 'Customer one',
        alias: 'Customer one',
        street: 'st',
        street_number: '123123',
        city: 'city',
        zipcode: 'zip',
        country: 'AR',
        contact_salutation: 'DR',
        contact_name: 'Pepe',
        contact_surname: 'Argento',
        email: 'bla@bla.com',
        phone: '123123123',
        latitude: 10.00001,
        longitude: 11.00001,
        deposit_agreement: 'BRING_KEY',
        keybox_code: null,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.error).equal('INVALID_TOUR');

    res = await request
      .post('/api/customers')
      .send({
        tour_id: tour.id,
        tour_position: 1,
        name: 'Customer one',
        alias: 'Customer one',
        street: 'st',
        street_number: '123123',
        city: 'city',
        zipcode: 'zip',
        country: 'AR',
        contact_salutation: 'DR',
        contact_name: 'Pepe',
        contact_surname: 'Argento',
        email: 'bla@bla.com',
        phone: '123123123',
        latitude: 10.00001,
        longitude: 11.00001,
        deposit_agreement: 'BRING_KEY',
        keybox_code: null,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.tour_id).equal(tour.id);
    expect(res.body.tour_position).equal(1);
    expect(res.body.name).equal('Customer one');
    expect(res.body.alias).equal('Customer one');
    expect(res.body.street).equal('st');
    expect(res.body.street_number).equal('123123');
    expect(res.body.city).equal('city');
    expect(res.body.zipcode).equal('zip');
    expect(res.body.country).equal('AR');
    expect(res.body.email).equal('bla@bla.com');
    expect(res.body.phone).equal('123123123');
    expect(res.body.contact_name).equal('Pepe');
  });

  // it('PUT /api/customers/:id should update a customer', async () => {
  //   const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
  //   const customer = await Helper.createCustomer(holding, supplier, tour);
  //
  //   let res = await request
  //     .put('/api/customers/0')
  //     .send({
  //       tour_id: tour.id,
  //       tour_position: 1,
  //       name: 'Customer one',
  //       alias: 'Customer one',
  //       street: 'st',
  //       street_number: '123123',
  //       city: 'city',
  //       zipcode: 'zip',
  //       country: 'AR',
  //       contact_salutation: 'DR',
  //       contact_name: 'Pepe',
  //       contact_surname: 'Arg',
  //       email: 'bla@bla.com',
  //       phone: '123123123',
  //       latitude: 10.00001,
  //       longitude: 11.00001,
  //       deposit_agreement: 'KEY_BOX',
  //       keybox_code: 'code',
  //     })
  //     .set('Authorization', `Bearer ${token}`);
  //
  //   expect(res.status).equal(404);
  //
  //   res = await request
  //     .put(`/api/customers/${customer.id}`)
  //     .send({
  //       tour_id: 9999,
  //       tour_position: 1,
  //       name: 'Customer one',
  //       alias: 'Customer one',
  //       street: 'st',
  //       street_number: '123123',
  //       city: 'city',
  //       zipcode: 'zip',
  //       country: 'AR',
  //       contact_salutation: 'DR',
  //       contact_name: 'Pepe',
  //       contact_surname: 'Arg',
  //       email: 'bla@bla.com',
  //       phone: '123123123',
  //       latitude: 10.00001,
  //       longitude: 11.00001,
  //       deposit_agreement: 'KEY_BOX',
  //       keybox_code: 'code',
  //     })
  //     .set('Authorization', `Bearer ${token}`);
  //
  //   expect(res.status).equal(400);
  //   expect(res.body.error).equal('INVALID_TOUR');
  //
  //   res = await request
  //     .put(`/api/customers/${customer.id}`)
  //     .send({
  //       tour_id: tour.id,
  //       tour_position: 1,
  //       name: 'Customer updated',
  //       alias: 'Customer updated',
  //       street: 'st',
  //       street_number: '123123',
  //       city: 'city',
  //       zipcode: 'zip',
  //       country: 'AR',
  //       contact_salutation: 'DR',
  //       contact_name: 'Pepe',
  //       contact_surname: 'Arg',
  //       email: 'bla@bla.com',
  //       phone: '123123123',
  //       latitude: 10.00001,
  //       longitude: 11.00001,
  //       number: 'blabla bla',
  //       deposit_agreement: 'KEY_BOX',
  //       keybox_code: 'code',
  //     })
  //     .set('Authorization', `Bearer ${token}`);
  //
  //   expect(res.status).equal(200);
  //   expect(res.body.name).equal('Customer updated');
  //   expect(res.body.alias).equal('Customer updated');
  //   expect(res.body.number).equal('blabla bla');
  //   expect(res.body.deposit_agreement).equal('KEY_BOX');
  //   expect(res.body.keybox_code).equal('code');
  // });
  //
  // it('GET /api/customers should return a list of customers', async () => {
  //   const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
  //   const customer = await Helper.createCustomer(holding, supplier, tour);
  //
  //   let res = await request
  //     .get('/api/customers')
  //     .set('Authorization', `Bearer ${token}`);
  //
  //   expect(res.status).equal(200);
  //   expect(res.body[0].id).equal(customer.id);
  //
  //   res = await request
  //     .get('/api/customers?limit=1')
  //     .set('Authorization', `Bearer ${token}`);
  //
  //   expect(res.status).equal(200);
  //   expect(res.body.length).equal(1);
  // });
  //
  // it('GET /api/customers/:id should return a customer', async () => {
  //   const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
  //   const customer = await Helper.createCustomer(holding, supplier, tour);
  //
  //   let res = await request
  //     .get(`/api/customers/9999`)
  //     .set('Authorization', `Bearer ${token}`);
  //
  //   expect(res.status).equal(404);
  //
  //   res = await request
  //     .get(`/api/customers/${customer.id}`)
  //     .set('Authorization', `Bearer ${token}`);
  //
  //   expect(res.status).equal(200);
  //   expect(res.body.supplier_id).equal(customer.supplier_id);
  //   expect(res.body.tour_id).equal(customer.tour_id);
  //   expect(res.body.tour_position).equal(customer.tour_position);
  //   expect(res.body.name).equal(customer.name);
  //   expect(res.body.alias).equal(customer.alias);
  //   expect(res.body.street).equal(customer.street);
  //   expect(res.body.street_number).equal(customer.street_number);
  //   expect(res.body.city).equal(customer.city);
  //   expect(res.body.zipcode).equal(customer.zipcode);
  //   expect(res.body.contact_name).equal(customer.contact_name);
  //   expect(res.body.contact_salutation).equal(customer.contact_salutation);
  //   expect(res.body.contact_surname).equal(customer.contact_surname);
  //   expect(res.body.country).equal(customer.country);
  //   expect(res.body.email).equal(customer.email);
  //   expect(res.body.phone).equal(customer.phone);
  //   expect(res.body.sms_notifications).equal(customer.sms_notifications);
  //   expect(res.body.email_notifications).equal(customer.email_notifications);
  //   expect(res.body.active).equal(customer.active);
  //   expect(res.body.latitude).equal(customer.coordinates.coordinates[1]);
  //   expect(res.body.longitude).equal(customer.coordinates.coordinates[0]);
  //   expect(res.body.Tour).eql({
  //     id: tour.id,
  //     name: tour.name,
  //   });
  // });
  //
  // it('DELETE /api/customers/:id should delete a customer', async () => {
  //   const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
  //   const customer = await Helper.createCustomer(holding, supplier, tour);
  //
  //   let res = await request
  //     .delete(`/api/customers/${customer.id}`)
  //     .set('Authorization', `Bearer ${token}`);
  //
  //   expect(res.status).equal(200);
  //
  //   res = await request
  //     .get(`/api/customers/${customer.id}`)
  //     .set('Authorization', `Bearer ${token}`);
  //   expect(res.status).equal(404);
  // });
  //
  // it('POST /api/customers should resolve the tour_position correctly', async () => {
  //   const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
  //   const newTour = await Helper.createTour(holding, supplier, transportAgent);
  //
  //   let customerOne = await Helper.createCustomer(holding, supplier, newTour, { tour_position: 1 });
  //   expect(customerOne.tour_position).equal(1);
  //
  //   let customerTwo = await Helper.createCustomer(holding, supplier, newTour, { tour_position: 2 });
  //   expect(customerTwo.tour_position).equal(2);
  //
  //   let customerThree = await Helper.createCustomer(holding, supplier, newTour, { tour_position: 3 });
  //   expect(customerThree.tour_position).equal(3);
  //
  //   let res = await request
  //     .post('/api/customers')
  //     .send({
  //       tour_id: newTour.id,
  //       tour_position: 2,
  //       name: 'Customer one',
  //       alias: 'Customer one',
  //       street: 'st',
  //       street_number: '123123',
  //       city: 'city',
  //       zipcode: 'zip',
  //       country: 'AR',
  //       contact_salutation: 'DR',
  //       contact_name: 'Pepe',
  //       contact_surname: 'Argento',
  //       email: 'bla@bla.com',
  //       phone: '123123123',
  //       latitude: 10.00001,
  //       longitude: 11.00001,
  //       deposit_agreement: 'BRING_KEY',
  //       keybox_code: null,
  //     })
  //     .set('Authorization', `Bearer ${token}`);
  //
  //   expect(res.status).equal(200);
  //   expect(res.body.tour_position).equal(2);
  //
  //   customerOne = await models.Customers.findByPk(customerOne.id, { raw: true });
  //   expect(customerOne.tour_position).equal(1);
  //
  //   customerTwo = await models.Customers.findByPk(customerTwo.id, { raw: true });
  //   expect(customerTwo.tour_position).equal(3);
  //
  //   customerThree = await models.Customers.findByPk(customerThree.id, { raw: true });
  //   expect(customerThree.tour_position).equal(4);
  // });
});
