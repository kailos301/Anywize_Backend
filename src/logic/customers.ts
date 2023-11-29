import Sequelize from 'sequelize';
import axios from 'axios';
import models from '../models';

export default {
  geocode: async (address: string) => {
    try {
      const { data } = await axios
        .get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=pk.eyJ1IjoiaW5mZW5zIiwiYSI6ImNrcHJpd2t1czA4dHAyb21ucmEyN2hlNzAifQ.UqPpun5dr8HdvlPPrRvx6A`);

      if (!data) {
        return null;
      }

      if (!data.features || !data.features.length) {
        return null;
      }

      return {
        coordinates: {
          type: 'Point',
          coordinates: data.features[0].center,
        },
      }
    } catch (err) {
      return null;
    }
  },
  fixPositioning: async (customer: Customer): Promise<void> => {
    const customers = await models.Customers.findAll({
      where: {
        tour_position: {
          [Sequelize.Op.gte]: customer.tour_position,
        },
        tour_id: customer.tour_id,
        id: {
          [Sequelize.Op.not]: customer.id,
        },
      },
      attributes: ['id', 'tour_id', 'tour_position'],
      order: [['tour_position', 'ASC']],
    });

    await Promise.all(
      customers.map((c, i) => {
        return c.update({
          tour_position: customer.tour_position + i + 1,
        });
      }),
    );

    return Promise.resolve();
  },
};
