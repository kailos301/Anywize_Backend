export default function(sequelize, DataTypes) {
  const Orders = sequelize.define('Orders', {
    supplier_id: {
      type: DataTypes.INTEGER,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    route_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    packages: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    departure: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    number: {
      type: DataTypes.STRING,
    },
    created_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    timestamps: false,
    tableName: 'orders',
    underscored: true,
  });


  Orders.associate = (models: any) => {
    Orders.belongsTo(models.Suppliers, { foreignKey: 'supplier_id' });
    Orders.belongsTo(models.Customers, { foreignKey: 'customer_id' });
    Orders.belongsTo(models.Routes, { foreignKey: 'route_id' });
    Orders.belongsTo(models.Users, { foreignKey: 'created_by_user_id' });
    Orders.belongsTo(models.Holdings, { foreignKey: 'holding_id' });
  };

  return Orders;
}
