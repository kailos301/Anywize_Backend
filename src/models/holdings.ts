import { v1 } from 'uuid';

export default function(sequelize, DataTypes) {
  const Holdings = sequelize.define('Holdings', {
    number: {
      type: DataTypes.STRING,
    },
    secret: {
      type: DataTypes.STRING,
      defaultValue: () => v1(),
    },
    name: {
      type: DataTypes.STRING,
    },
    alias: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    street_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zipcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coordinates: {
      type: DataTypes.GEOMETRY('POINT'),
      defaultValue: () => ({
        type: 'Point',
        coordinates: [0, 0],
      }),
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
    },
  }, {
    timestamps: false,
    tableName: 'holdings',
    underscored: true,
  });


  Holdings.associate = (models: any) => {
    Holdings.hasMany(models.Suppliers, { foreignKey: 'holding_id' });
    Holdings.hasMany(models.Users, { foreignKey: 'holding_id' });
  };

  return Holdings;
}
