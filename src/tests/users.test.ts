import 'mocha';
import { expect } from 'chai';
import Helper from './_helper';

const { request } = Helper;

describe('Users tests', () => {
  it('GET /api/users/me should return logged in user', async () => {
    const { user, token } = await Helper.createUser();

    let res = await request
      .get('/api/users/me');

    expect(res.status).equal(401);

    res = await request
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).equal(200);
    expect(res.body.id).eql(user.id);
    expect(res.body.name).eql(user.name);
    expect(res.body.surname).eql(user.surname);
    expect(res.body.email).eql(user.email);
  });
});
