import { v1 } from 'uuid';
import Sequelize from "sequelize";

export default function(sequelize, DataTypes) {
  const Routes = sequelize.define('Routes', {
    tour_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uuid: {
      type: DataTypes.STRING,
      defaultValue: () => v1(),
    },
    pathway: {
      // type: DataTypes.JSON,
      type: Sequelize.DataTypes.JSON,
      defaultValue: () => ([]),
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    active_driver_jwt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    driver_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    driver_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
    }
  }, {
    timestamps: false,
    tableName: 'routes',
    underscored: true,
  });


  Routes.associate = (models: any) => {
    Routes.belongsTo(models.Tours, { foreignKey: 'tour_id' });
    Routes.hasMany(models.Orders, { foreignKey: 'route_id' });
    Routes.hasMany(models.Stops, { foreignKey: 'route_id' });
    Routes.hasMany(models.DriversLocations, { foreignKey: 'route_id' });
    Routes.hasMany(models.RoutesNavigations, { foreignKey: 'route_id' });
    Routes.belongsTo(models.Holdings, { foreignKey: 'holding_id' });
  };

  return Routes;
}
