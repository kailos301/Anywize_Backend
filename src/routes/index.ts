import * as express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated';
import isAdmin from '../middlewares/isAdmin';
import models from '../models';
import RoutesEvents from '../logic/routes-events';
import RoutesLogic from '../logic/routes';

const _package = require('../../package.json');

const router = express.Router();

import auth from './auth';
import suppliers from './suppliers';
import users from './users';
import tours from './tours';
import customers from './customers';
import transportAgents from './transport-agents';
import orders from './orders';
import routes from './routes';
import drivers from './drivers';
import importing from './import';

router.get('/event/:id', async (req, res, next) => {
  const { id } = req.params;

  const emitter = RoutesEvents();

  emitter.emit('route-updated', { id });

  return res.send('ok');
});

router.get('/ping', async (req, res, next) => {
  try {
    await models.Users.findOne();

    return res.send(`Pong ${_package.version}`);
  } catch (err) {
    return next(err);
  }
});

router.use('/api/auth', auth);
router.use('/api/suppliers', isAuthenticated, isAdmin, suppliers);
router.use('/api/users', isAuthenticated, users);
router.use('/api/tours', isAuthenticated, tours);
router.use('/api/customers', isAuthenticated, customers);
router.use('/api/transport-agents', isAuthenticated, transportAgents);
router.use('/api/orders', isAuthenticated, orders);
router.use('/api/routes', isAuthenticated, routes);
router.use('/api/drivers', drivers);
router.use('/api/import', importing);
router.get('/api/lareputamadrequeloparioacristo', async (req, res, next) => {
  try {
    await RoutesLogic.archive();
  } catch (err) {
    return next(err);
  }
})

export default router;
