import Joi from 'joi';

export class ValidationError extends Error {
  errors: any;
  type: string = 'VALIDATION_ERROR';

  constructor(errors, type?) {
    super('Validation failed');

    this.errors = errors;

    if (type) {
      this.type = type;
    }
  }
}

export default function validate(data, schema) {
  const result = schema.validate(data, { abortEarly: false });

  if (result.error) {
    const errors = result.error.details.reduce((acc, cur) => {

      const key = cur.path.join('.');

      acc[key] = cur.message;

      return acc;
    }, {});

    throw new ValidationError(errors);
  }
}
