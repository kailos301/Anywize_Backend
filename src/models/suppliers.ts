import { v1 } from 'uuid';

export default function(sequelize, DataTypes) {
  const Suppliers = sequelize.define('Suppliers', {
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
    tableName: 'suppliers',
    underscored: true,
  });


  Suppliers.associate = (models: any) => {
    Suppliers.hasMany(models.Users, { foreignKey: 'supplier_id' });
  };

  return Suppliers;
}
