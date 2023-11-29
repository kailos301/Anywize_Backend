export default function (sequelize, DataTypes) {
  const Tours = sequelize.define('Tours', {
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    transport_agent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tableName: 'tours',
    underscored: true,
  });


  Tours.associate = (models: any) => {
    Tours.belongsTo(models.Suppliers, {foreignKey: 'supplier_id'});
    Tours.belongsTo(models.TransportAgents, {foreignKey: 'transport_agent_id'});
  };

  return Tours;
}
