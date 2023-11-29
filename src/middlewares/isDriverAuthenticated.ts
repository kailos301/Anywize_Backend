import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET } from '../passport';
import { ExtractJwt }  from 'passport-jwt';
import models from '../models';

const Debug = debug('anywize:driver-auth-middleware');

/**
 * The drivers JWT contains the route uuid
 * This function gets the jwt from the header, decodes it
 * and checks that the route actually exists and its still not finished.
 *
 * Otherwise throws 401
 */
export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    Debug(`Token extracted: ${token}`);

    if (!token) {
      throw createError(401);
    }

    try {
      const payload = jwt.verify(token, SECRET);

      Debug(payload);

      if (!payload.uuid) {
        throw createError(401);
      }

      const route = await models.Routes.findOne({
        where: {
          uuid: payload.uuid,
          end_date: null,
          active_driver_jwt: token,
        },
        attributes: ['id', 'uuid'],
        raw: true,
      });

      if (!route) {
        throw createError(401);
      }

      req.route = { id: route.id, uuid: route.uuid };

      return next();
    } catch (err) {
      Debug(err.message);

      throw createError(401);
    }
  } catch (err) {
    return next(err);
  }
};