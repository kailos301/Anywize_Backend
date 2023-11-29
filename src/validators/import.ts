import Joi from 'joi';
import Validate from './index';

const ImportCompleteSchema = Joi.object().keys({
  supplier_id: Joi.string().required(),
  secret: Joi.string().required(),
  Tour: Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
  }).required(),
  Customers: Joi.array().items(
    Joi.object().keys({
      id: Joi.string().required(),
      name: Joi.string().required(),
      alias: Joi.string().optional().allow(null),
      street: Joi.string().required(),
      street_number: Joi.string().required(),
      city: Joi.string().required(),
      zipcode: Joi.string().required(),
      country: Joi.string().min(2).max(2).optional().allow(null),
      deposit_agreement: Joi.string().required().valid('NONE', 'BRING_KEY', 'KEY_BOX'),
      keybox_code: Joi.any().when('deposit_agreement', {
        is: 'KEY_BOX',
        then: Joi.string().required(),
        otherwise: Joi.string().optional().allow(null, ''),
      }),
      latitude: Joi.number().precision(8).optional().allow(null),
      longitude: Joi.number().precision(8).optional().allow(null),
      contact_name: Joi.string().optional().allow(null),
      contact_surname: Joi.string().optional().allow(null),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
    }),
  ).min(1).required(),
  Orders: Joi.array().items(
    Joi.object().keys({
      number: Joi.string().optional().allow(null),
      customer_id: Joi.string().required(),
      description: Joi.string().required(),
      Packages: Joi.array().optional().allow(null),
    })
  ).min(1).required(),
});

export default {
  complete: (data) => Validate(data, ImportCompleteSchema),
};
