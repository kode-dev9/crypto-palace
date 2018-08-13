'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profilePhoto: {
      type: DataTypes.STRING(1234),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    bitcoinAddress: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    adminType: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isBanned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    totalReferrals: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    referred: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    referralBonus: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    }
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Testimony, {
      foreignKey: 'user',
      as: 'testimonies',
    });

    User.hasMany(models.Refferal, {
      foreignKey: 'user',
      as: 'user',
    }, {
      foreignKey: 'referral',
      as: 'referral',
    });

    User.hasMany(models.Trade, {
      foreignKey: 'user',
      as: 'transactions',
    })
  };

  User.prototype.toJSON = function() {
    let values = this.get();
    delete values.password;
    delete values.createdAt
    delete values.updatedAt
    return values;
  };
  return User;
};
