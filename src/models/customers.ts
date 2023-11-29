export default function(sequelize, DataTypes) {
  const Customers = sequelize.define('Customers', {
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tour_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tour_position: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    number: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    name: {
      type: DataTypes.STRING,
    },
    alias: {
      type: DataTypes.STRING,
    },
    street: {
      type: DataTypes.STRING,
    },
    street_number: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    zipcode: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    deposit_agreement: {
      type: DataTypes.STRING,
      defaultValue: 'NONE',
    },
    keybox_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coordinates: {
      type: DataTypes.GEOMETRY('POINT'),
      defaultValue: () => ({
        type: 'Point',
        coordinates: [0, 0],
      }),
    },
    contact_salutation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_surname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    sms_notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    latitude: {
      type: new DataTypes.VIRTUAL(DataTypes.STRING, ['coordinates']),
      get: function () {
        if (!this.get('coordinates')) {
          return null;
        }

        return this.get('coordinates').coordinates[1];
      },
    },
    longitude: {
      type: new DataTypes.VIRTUAL(DataTypes.STRING, ['coordinates']),
      get: function () {
        if (!this.get('coordinates')) {
          return null;
        }

        return this.get('coordinates').coordinates[0];
      },
    },
  }, {
    timestamps: false,
    tableName: 'customers',
    underscored: true,
  });


  Customers.associate = (models: any) => {
    Customers.belongsTo(models.Suppliers, { foreignKey: 'supplier_id' });
    Customers.belongsTo(models.Tours, { foreignKey: 'tour_id' });
    Customers.hasMany(models.Orders, { foreignKey: 'customer_id' });
    Customers.belongsTo(models.Holdings, { foreignKey: 'holding_id' });
  };

  return Customers;
}
