export default function(sequelize, DataTypes) {
  const Stops = sequelize.define('Stops', {
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    route_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    signature_file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_signed: {
      type: DataTypes.BOOLEAN,
    },
    location: {
      type: DataTypes.GEOMETRY('POINT'),
      defaultValue: () => ({
        type: 'Point',
        coordinates: [0, 0],
      }),
    },
    pictures: {
      type: DataTypes.JSON,
      defaultValue: () => ([]),
    },
    meet_customer: {
      type: DataTypes.BOOLEAN,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    driver_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    driver_phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    goods_back: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: false,
    tableName: 'stops',
    underscored: true,
  });


  Stops.associate = (models: any) => {
    Stops.belongsTo(models.Customers, { foreignKey: 'customer_id' });
    Stops.belongsTo(models.Routes, { foreignKey: 'route_id' });
  };

  return Stops;
}
