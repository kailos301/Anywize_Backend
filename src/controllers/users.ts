import { Request, Response, NextFunction } from 'express';
import * as UsersLogic from '../logic/users';
import models from '../models';

export default {
  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;

      const pub = UsersLogic.getPublicInfo(user);

      if (user.supplier_id) {
        pub.Supplier = await models.Suppliers.findOne({
          where: { id: user.supplier_id },
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
            'coordinates',
          ],
          raw: true,
        });
      }

      return res.send(pub);
    } catch (err) {
      return next(err);
    }
  },
};
