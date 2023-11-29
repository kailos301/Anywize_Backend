import _ from 'lodash';
import Sequelize from 'sequelize';
import { DateTime } from 'luxon';

const parseOrder = (order: any): any => {
  if (!order) {
    return [['id', 'desc']];
  }

  if (_.isString(order)) {
    const [field = 'id', direction = 'desc'] = order.split(' ');

    return [[field, direction]];
  }

  if (Array.isArray(order)) {
    return order.map((sub) => {
      const [field = 'id', direction = 'desc'] = sub.split(' ');

      return [field, direction];
    });
  }
};

const parseWhere = (query: any, transformers: any = {}, defaults = {}): any => {
  if (query.where) {
    if (_.isString(query.where)) {
      return JSON.parse(query.where);
    }

    if (_.isObject(query.where)) {
      return query.where;
    }
  }

  const where = _.omit(query, ['limit', 'offset', 'order', 'attributes']);

  return Object.keys(where).reduce((acc, key) => {
    if (transformers[key]) {
      if (_.isFunction(transformers[key])) {
        acc[key] = transformers[key](where[key]);
      } else {
        const { key: newKey, func } = transformers[key];

        acc[newKey] = func(where[key]);
      }
    } else {
      acc[key] = where[key];
    }

    return acc;
  }, { ...defaults });
};

const parseAttributes = (attributes: any): any => {
  if (!attributes) {
    return { exclude: [] };
  }

  return attributes.split(',').map(a => a.trim());
}

export default function parseQueryString(query: any): any {
  const limit = _.toNumber(query.limit) || 10;
  const offset = _.toNumber(query.offset) || 0;
  const order = parseOrder(query.order);
  const where = parseWhere(query);
  const attributes = parseAttributes(query.attributes);

  return { limit, offset, order, where, attributes };
}

export function extendedQueryString(transformers: any, defaults = {}): Function {
  return (query: any): any => {
    const limit = _.toNumber(query.limit) || 10;
    const offset = _.toNumber(query.offset) || 0;
    const order = parseOrder(query.order);
    const where = parseWhere(query, transformers, defaults);
    const attributes = parseAttributes(query.attributes);

    return { limit, offset, order, where, attributes };
  };
}

export function parseFilterDates(query: any) {
  const where: any = {};

  if (query.start_date_from || query.start_date_to) {
    where.start_date = {};
  }

  if (query.end_date_from || query.end_date_to) {
    where.end_date = {};
  }

  if (query.start_date_from) {
    where.start_date[Sequelize.Op.gte] = DateTime.fromISO(query.start_date_from).startOf('day').toISO();
  }

  if (query.start_date_to) {
    where.start_date[Sequelize.Op.lte] = DateTime.fromISO(query.start_date_to).endOf('day').toISO();
  }

  if (query.end_date_from) {
    where.end_date[Sequelize.Op.gte] = DateTime.fromISO(query.end_date_from).startOf('day').toISO();
  }

  if (query.end_date_to) {
    where.end_date[Sequelize.Op.lte] = DateTime.fromISO(query.end_date_to).endOf('day').toISO();
  }

  return where;
}