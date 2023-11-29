import Joi from 'joi';
import Validate from './index';

const CreateSchema = Joi.object().keys({
  tour_id: Joi.number().integer().required(),
  tour_position: Joi.number().integer().required(),
  number: Joi.string().optional().allow(null, ''),
  name: Joi.string().required(),
  alias: Joi.string().required(),
  street: Joi.string().required(),
  street_number: Joi.string().required(),
  city: Joi.string().required(),
  zipcode: Joi.string().required(),
  country: Joi.string().min(2).max(2).required(),
  contact_salutation: Joi.string().optional().allow(null, ''),
  contact_name: Joi.string().optional().allow(null, ''),
  contact_surname: Joi.string().optional().allow(null, ''),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  sms_notifications: Joi.boolean().truthy(1, '1').falsy(0, '0').optional(),
  email_notifications: Joi.boolean().truthy(1, '1').falsy(0, '0').optional(),
  active: Joi.boolean().truthy(1, '1').falsy(0, '0').optional(),
  latitude: Joi.number().precision(8).required(),
  longitude: Joi.number().precision(8).required(),
  deposit_agreement: Joi.string().required().valid('NONE', 'BRING_KEY', 'KEY_BOX'),
  keybox_code: Joi.any().when('deposit_agreement', {
    is: 'KEY_BOX',
    then: Joi.string().required(),
    otherwise: Joi.string().optional().allow(null, ''),
  }),
});

export default {
  create: (data) => Validate(data, CreateSchema),
  update: (data) => Validate(data, CreateSchema),
};
