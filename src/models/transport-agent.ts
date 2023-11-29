export default function(sequelize, DataTypes) {
  const TransportAgents = sequelize.define('TransportAgents', {
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
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    timestamps: false,
    tableName: 'transport_agents',
    underscored: true,
  });


  TransportAgents.associate = (models: any) => {
    TransportAgents.hasMany(models.Tours, { foreignKey: 'transport_agent_id' });
  };

  return TransportAgents;
}
