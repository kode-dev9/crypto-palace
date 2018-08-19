'use strict';
module.exports = (sequelize, DataTypes) => {
  var Wallet = sequelize.define('Wallet', {
    user: {
      allowNull: false,
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Users',
        key: 'id',
        as: 'user',
      }
    },
    referralBonus: {
      allowNull: false,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    investment: {
      allowNull: false,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    balance: {
      allowNull: false,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    totalDeposit: {
      allowNull: false,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    totalWithdrawn: {
      allowNull: false,
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    totalTransactions: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    ongoingTransactions: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    completedTransactions: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {});
  Wallet.associate = function(models) {
    Wallet.belongsTo(models.User, {
      foreignKey: 'user',
      onDelete: 'CASCADE',
    });
  };
  return Wallet;
};
