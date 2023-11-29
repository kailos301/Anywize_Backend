import 'mocha';
import { expect } from 'chai';
import Helper from './_helper';

const { request } = Helper;

describe('Transport agents tests', () => {
  it('/api/transport-agents/* should return 401 if not logged in', async () => {
    let res = await request
      .get('/api/transport-agents');

    expect(res.status).equal(401);
  });

  it('GET /api/transport-agents should return a list of transport agents', async () => {
    const { token } = await Helper.createUser();
    await Helper.createTransportAgent();

    const res = await request
      .get('/api/transport-agents')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    res.body.forEach((ta) => {
      expect(ta).to.have.property('id');
      expect(ta).to.have.property('name');
      expect(ta).to.have.property('alias');
      expect(ta).to.have.property('street');
      expect(ta).to.have.property('street_number');
      expect(ta).to.have.property('city');
      expect(ta).to.have.property('country');
    });
  });
});
