export default function(sequelize, DataTypes) {
  const DriversLocations = sequelize.define('DriversLocations', {
    route_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    location: {
      type: DataTypes.GEOMETRY('POINT'),
      defaultValue: () => ({
        type: 'Point',
        coordinates: [0, 0],
      }),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
    },
  }, {
    timestamps: false,
    tableName: 'drivers_locations',
    underscored: true,
  });


  DriversLocations.associate = (models: any) => {
    DriversLocations.belongsTo(models.Routes, { foreignKey: 'route_id' });
  };

  return DriversLocations;
}
