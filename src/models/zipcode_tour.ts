export default function(sequelize, DataTypes) {
  const Zipcode_Tour = sequelize.define('Zipcode_Tour', {
    holding_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tour_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    zipcode: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tableName: 'zipcode_tour',
    underscored: true,
  });


  Zipcode_Tour.associate = (models: any) => {
    Zipcode_Tour.belongsTo(models.Tours, { foreignKey: 'tour_id' });
    Zipcode_Tour.belongsTo(models.Holdings, { foreignKey: 'holding_id' });
    // Zipcode_Tour.hasMany(models.Tours, { foreignKey: 'tour_id' });
    Zipcode_Tour.hasMany(models.Holdings, { foreignKey: 'holding_id' });
  };


  return Zipcode_Tour;
}
