'use strict';
module.exports = (sequelize, DataTypes) => {
  var Trade = sequelize.define('Trade', {
    user: {
      allowNull: false,
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Users',
        key: 'id',
        as: 'user',
      },
    },
    package: {
      allowNull: false,
      type: DataTypes.STRING(20)
    },
    miningFee: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    dailyEarnings: {
      allowNull: false,
      type: DataTypes.FLOAT
    },
    totalEarnings: {
      allowNull: false,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    duration: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    durationTime: {
      allowNull: true,
      type: DataTypes.DATE
    },
    earningStart: {
      allowNull: true,
      type: DataTypes.DATE
    },
    earning: {
      allowNull: false,
      type: DataTypes.FLOAT
    },
    investing: {
      allowNull: false,
      type: DataTypes.FLOAT
    },
    status: {
      allowNull: false,
      type: DataTypes.TINYINT,
      defaultValue: 0 //0 for not pending, 1 for ongoing, 2 for completed
    }
  }, {});
  Trade.associate = function(models) {
    Trade.belongsTo(models.User, {
      foreignKey: 'user',
      onDelete: 'CASCADE',
    });
  };
  return Trade;
};
