'use strict';
module.exports = (sequelize, DataTypes) => {
  var Refferal = sequelize.define('Refferal', {
    referral: {
      tallowNull: false,
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Users',
        key: 'id',
        as: 'referral',
      },
    },
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
    isDone: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {});
  Refferal.associate = function(models) {
    Refferal.belongsTo(models.User, {
      foreignKey: 'user',
      onDelete: 'CASCADE',
    }, {
      foreignKey: 'referral',
      onDelete: 'CASCADE',
    });
  };
  return Refferal;
};