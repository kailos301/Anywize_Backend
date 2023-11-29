import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import * as UsersLogic from '../logic/users';
import UsersValidator from '../validators/users';
import models from '../models';

type LoginBody = {
  email: string;
  password: string;
};

export default {
  // TODO: REMOVE
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req;
      const user = await models.Users.create(body);

      console.log("body", body);

      return res.send(user);
    } catch (err) {
      return next(err);
    }
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body }: { body: LoginBody } = req;

      await UsersValidator.login(body);

      const user = await models.Users.findOne({
        where: {
          email: body.email,
          active: true,
        },
        raw: true,
        nest: true,
        include: [{
          model: models.Suppliers,
          attributes: [
            'name',
            'alias',
            'street',
            'street_number',
            'city',
            'zipcode',
            'country',
            'email',
            'phone',
          ],
        }],
      });

      if (!user) {
        throw createError(401, 'INVALID_AUTH');
      }

      const passwordMatches = await UsersLogic.comparePasswords(user.password, body.password);

      if (!passwordMatches) {
        throw createError(401, 'INVALID_AUTH');
      }

      return res.send({
        token: UsersLogic.getJWT(user),
        user: UsersLogic.getPublicInfo(user),
      });
    } catch (err) {
      return next(err);
    }
  },
};
