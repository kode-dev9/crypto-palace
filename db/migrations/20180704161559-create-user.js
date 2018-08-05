'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      profilePhoto: {
        type: Sequelize.STRING(1234),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      bitcoinAddress: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      adminType: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isBanned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      totalReferrals: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      referred: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      referralBonus: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};
