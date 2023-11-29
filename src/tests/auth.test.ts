import 'mocha';
import { expect } from 'chai';
import Helper from './_helper';

const { request } = Helper;

describe('Auth tests', () => {
  it('POST /api/auth/login should login the user', async () => {
    const { user } = await Helper.createUser();

    let res = await request
      .post('/api/auth/login')
      .send({});

    expect(res.status).equal(400);
    expect(res.body.errors).eql({
      email: '"email" is required',
      password: '"password" is required',
    });

    res = await request
      .post('/api/auth/login')
      .send({
        email: 'bla@bla.com',
        password: 'blablabla',
      });

    expect(res.status).equal(401);
    expect(res.body.error).eql('INVALID_AUTH');

    res = await request
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'blablabla',
      });

    expect(res.status).equal(401);
    expect(res.body.error).eql('INVALID_AUTH');

    res = await request
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'testtest',
      });

    expect(res.status).equal(200);
    expect(res.body.user.id).eql(user.id);
    expect(res.body.token).to.be.a('string');
  });
});
