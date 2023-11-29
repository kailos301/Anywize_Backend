import Joi from 'joi';
import Validate from './index';

const LoginSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export default {
  login: (data) => Validate(data, LoginSchema),
};
