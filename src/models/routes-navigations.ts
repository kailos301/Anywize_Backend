export default function(sequelize, DataTypes) {
  const RoutesNavigations = sequelize.define('RoutesNavigations', {
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    route_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    navigation: {
      type: DataTypes.JSON,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
    }
  }, {
    timestamps: false,
    tableName: 'routes_navigations',
    underscored: true,
  });


  RoutesNavigations.associate = (models: any) => {
    RoutesNavigations.belongsTo(models.Customers, { foreignKey: 'customer_id' });
    RoutesNavigations.belongsTo(models.Routes, { foreignKey: 'route_id' });
  };

  return RoutesNavigations;
}
