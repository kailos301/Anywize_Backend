import { v1 } from 'uuid';
import * as UsersLogic from '../logic/users';

export default function(sequelize, DataTypes) {
  const Users = sequelize.define('Users', {
    holding_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    surname: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    token: {
      type: DataTypes.STRING,
      defaultValue: () => v1(),
    },
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    permissions: {
      type: DataTypes.JSON,
      defaultValue: () => ({
        routesList: true,
        routesMap: true,
        routesCreateForDriver: true,
        routesCreateDeliveryOrder: false,
        ordersList: true,
        orderListHolding: true,
        ordersCreate: true,
        customersCreate: true,
        customersHideLocationRelatedFields: false,
        toursCreate: true,
        showMasterData: true,
      }),
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
    tableName: 'users',
    underscored: true,
  });


  Users.associate = (models: any) => {
    Users.belongsTo(models.Suppliers, { foreignKey: 'supplier_id' });
    Users.belongsTo(models.Holdings, { foreignKey: 'holding_id' });
  };

  Users.beforeCreate(async (user) => {
    if (user.password) {
      const hash = await UsersLogic.encryptPassword(user);

      user.setDataValue('password', hash);
    }

    return Promise.resolve();
  });

  return Users;
}
