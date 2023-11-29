import { Request, Response, NextFunction } from 'express';
import models from '../models';

export default {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await models.TransportAgents.findAll({
        raw: true,
        order: [['alias', 'ASC']]
      });

      return res.send(results);
    } catch (err) {
      return next(err);
    }
  },
};
