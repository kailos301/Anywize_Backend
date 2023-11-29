import 'mocha';
import { expect } from 'chai';
import Helper from './_helper';

const { request } = Helper;

describe('Tours tests', () => {
  let holding: Holding;
  let supplier: Supplier;
  let transportAgent: TransportAgent;

  before(async () => {
    holding = await Helper.createHolding();
    supplier = await Helper.createSupplier();
    transportAgent = await Helper.createTransportAgent();
  });

  it('/api/tours/* should return 401 when not logged in', async () => {
    let res = await request.post('/api/tours');
    expect(res.status).equal(401);

    res = await request.put('/api/tours/1');
    expect(res.status).equal(401);

    res = await request.get('/api/tours');
    expect(res.status).equal(401);

    res = await request.get('/api/tours/1');
    expect(res.status).equal(401);

    res = await request.get('/api/tours/1/next-position');
    expect(res.status).equal(401);

    res = await request.delete('/api/tours/1');
    expect(res.status).equal(401);
  });

  it('/api/tours/* should return 403 when user has no supplier_id set', async () => {
    const { token } = await Helper.createUser();

    let res = await request.post('/api/tours').set('Authorization', `Bearer ${token}`);
    expect(res.status).equal(403);

    res = await request.put('/api/tours/1').set('Authorization', `Bearer ${token}`);;
    expect(res.status).equal(403);

    res = await request.get('/api/tours/1/next-position').set('Authorization', `Bearer ${token}`);;
    expect(res.status).equal(403);

    res = await request.get('/api/tours').set('Authorization', `Bearer ${token}`);;
    expect(res.status).equal(403);

    res = await request.get('/api/tours/1').set('Authorization', `Bearer ${token}`);;
    expect(res.status).equal(403);
  });

  it('POST /api/tours should create a tour', async () => {
    const { token } = await Helper.createUser({ supplier_id: supplier.id });

    let res = await request
      .post('/api/tours')
      .send({})
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.errors).eql({
      transport_agent_id: '"transport_agent_id" is required',
      name: '"name" is required',
    });

    res = await request
      .post('/api/tours')
      .send({
        transport_agent_id: transportAgent.id,
        name: 'Tour one',
        description: 'this is the tour 1',
        active: 1,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.transport_agent_id).equal(transportAgent.id);
    expect(res.body.name).equal('Tour one');
    expect(res.body.description).equal('this is the tour 1');
    expect(res.body.active).equal(true);
  });

  it('PUT /api/tours should update a tour', async () => {
    const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const tour = await Helper.createTour(holding, supplier, transportAgent);

    let res = await request
      .put('/api/tours/0')
      .send({
        name: 'updated',
        description: 'also updated',
        active: true,
        transport_agent_id: transportAgent.id,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(404);

    res = await request
      .put(`/api/tours/${tour.id}`)
      .send({})
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.errors).eql({
      transport_agent_id: '"transport_agent_id" is required',
      name: '"name" is required',
    });

    res = await request
      .put(`/api/tours/${tour.id}`)
      .send({
        name: 'updated',
        description: 'also updated',
        active: true,
        transport_agent_id: transportAgent.id,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.name).equal('updated');
    expect(res.body.description).equal('also updated');
  });

  it('GET /api/tours should return a list of tours', async () => {
    const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const tour = await Helper.createTour(holding, supplier, transportAgent);

    let res = await request
      .get('/api/tours')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body[0].id).equal(tour.id);

    res = await request
      .get('/api/tours?limit=1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.length).equal(1);
  });

  it('GET /api/tours/:id should return a single tours', async () => {
    const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });
    const tour = await Helper.createTour(holding, supplier, transportAgent);

    let res = await request
      .get('/api/tours/0')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(404);

    res = await request
      .get(`/api/tours/${tour.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.id).equal(tour.id);
    expect(res.body.TransportAgent.id).equal(transportAgent.id);
  });

  it('DELETE /api/tours should delete a tour when it has no customers attached', async () => {
    let tour = await Helper.createTour(holding, supplier, transportAgent);
    const { token } = await Helper.createUser({ holding_id: holding.id, supplier_id: supplier.id });

    let res = await request
      .delete(`/api/tours/${tour.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);

    res = await request
      .get(`/api/tours/${tour.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(404);


    tour = await Helper.createTour(holding, supplier, transportAgent);
    await Helper.createCustomer(holding, supplier, tour);

    res = await request
      .delete(`/api/tours/${tour.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(400);
    expect(res.body.error).equal('TOUR_CONTAINS_CUSTOMERS');
  });

  it('GET /api/tours/:id/next-position should return next position in the tour', async () => {
    let tour = await Helper.createTour(holding, supplier, transportAgent);
    const { token } = await Helper.createUser({ supplier_id: supplier.id });

    let res = await request
      .get(`/api/tours/${tour.id}/next-position`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.tour_position).equal(1);

    await Helper.createCustomer(holding, supplier, tour, { tour_position: 10 });

    res = await request
      .get(`/api/tours/${tour.id}/next-position`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.tour_position).equal(11);
  });
});
