import Joi from 'joi';
import Validate from './index';

const LoginSchema = Joi.object().keys({
  code: Joi.string().required(),
  password: Joi.string().required(),
});

const LocationSchema = Joi.alternatives().try(
  Joi.array().items(
    Joi.object().keys({
      latitude: Joi.number().precision(8).required(),
      longitude: Joi.number().precision(8).required(),
      created_at: Joi.date().optional(),
    }),
  ),
  Joi.object().keys({
    latitude: Joi.number().precision(8).required(),
    longitude: Joi.number().precision(8).required(),
    created_at: Joi.date().optional(),
  }),
);

const CreateStopSchema = Joi.object().keys({
  customer_id: Joi.number().integer().required(),
  time: Joi.date().iso().required(),
  customer_signed: Joi.boolean().truthy(1, '1').falsy(0, '0').required(),
  latitude: Joi.number().precision(8).required(),
  longitude: Joi.number().precision(8).required(),
  meet_customer: Joi.boolean().truthy(1, '1').falsy(0, '0').required(),
  reason: Joi.string().optional().allow(null, ''),
  driver_name: Joi.string().required(),
  driver_phone: Joi.string().required(),
  goods_back: Joi.boolean().truthy(1, '1').falsy(0, '0').required(),
});

const SetNameSchema = Joi.object().keys({
  driver_name: Joi.string().required(),
  driver_phone: Joi.string().required(),
});

const AddNavigationSchema = Joi.object().keys({
  customer_id: Joi.number().integer().required(),
  navigation: Joi.object().required(),
});

export default {
  login: (data) => Validate(data, LoginSchema),
  location: (data) => Validate(data, LocationSchema),
  createStop: (data) => Validate(data, CreateStopSchema),
  setName: (data) => Validate(data, SetNameSchema),
  addNavigation: (data) => Validate(data, AddNavigationSchema),
};
