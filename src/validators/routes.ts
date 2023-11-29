import Joi from 'joi';
import Validate from './index';

const CreateSchema = Joi.object().keys({
  order_ids: Joi.array().items(Joi.number().integer().required()).min(1).required(),
  tour_id: Joi.number().integer().required(),
  type: Joi.string().optional().valid(null, 'DELIVERY'),
});

const ExportSchema = Joi.object().keys({
  from: Joi.date().iso().required(),
  to: Joi.date().iso().required(),
});

export default {
  create: (data) => Validate(data, CreateSchema),
  export: (data) => Validate(data, ExportSchema),
};
