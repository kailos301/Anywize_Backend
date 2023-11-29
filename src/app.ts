import express from 'express';
import _ from 'lodash';
import bodyParser from 'body-parser';
import Debug from 'debug';
import cors from 'cors';
import compression from 'compression';
import * as Sentry from "@sentry/node";
import initializePassport from './passport';
const passport = require('passport');

const debug = Debug('anywize');
const app = express();

Sentry.init({
  dsn: process.env.ANYWIZE_SENTRY_DSN,
});

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

app.disable('x-powered-by');
app.use(compression());

app.use(Sentry.Handlers.requestHandler());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: '*', // config.get('allowedOrigins').split(','),
    allowedHeaders: 'Content-Type, Authorization, Content-Length, X-Requested-With',
  }),
);
app.options(
  cors({
    origin: '*', // config.get('allowedOrigins').split(','),
    allowedHeaders: 'Content-Type, Authorization, Content-Length, X-Requested-With',
  }),
);

app.use((req, res, next) => {
  req.connection.setTimeout(120 * 1000);

  res.set('Access-Control-Expose-Headers', 'X-Total-Count');

  return next();
});
app.use('/apidoc', (req, res, next) => {
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

  if (login && password && login === 'admin' && password === 'anywize2021') {
    return next()
  }

  res.set('WWW-Authenticate', 'Basic realm="401"');
  return res.status(401).send('Authentication required.');
}, express.static(__dirname + '/../apidoc'));

require('./models');

app.use(passport.initialize());
initializePassport(passport);

import routes from './routes';
app.use(routes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err: any = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(Sentry.Handlers.errorHandler());

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  debug(err);
  debug(err.stack);
  res.status(err.status || 400);

  if (['VALIDATION_ERROR'].includes(err.type)) {
    return res.send({
      error: err.type,
      errors: err.errors,
    });
  }

  return res
    .status(err.status || 400)
    .json({ error: err.message, stack: err.stack });
});

require('./cron');

export default app;
