'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('trades', {
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
        },
      },
      package: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      miningFee: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      dailyEarnings: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      totalEarnings: {
        allowNull: false,
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      duration: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      durationTime: {
        allowNull: true,
        type: Sequelize.DATE
      },
      earningStart: {
        allowNull: true,
        type: Sequelize.DATE
      },
      earning: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      investing: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      status: {
        allowNull: false,
        type: Sequelize.TINYINT,
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
    return queryInterface.dropTable('trades');
  }
};
