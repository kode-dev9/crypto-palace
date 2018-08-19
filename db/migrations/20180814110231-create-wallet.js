'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Wallets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
          as: 'user',
        }
      },
      referralBonus: {
        allowNull: false,
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      balance: {
        allowNull: false,
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      investment: {
        allowNull: false,
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      totalDeposit: {
        allowNull: false,
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      totalWithdrawn: {
        allowNull: false,
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      totalTransactions: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      ongoingTransactions: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      completedTransactions: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    return queryInterface.dropTable('Wallets');
  }
};
