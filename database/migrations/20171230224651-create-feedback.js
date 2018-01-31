'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Feedbacks', {
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      path: {
        defaultValue: '/',
        type: Sequelize.STRING
      },
      question: {
        allowNull: false,
        type: Sequelize.STRING
      },
      anger: {
        defaultValue: 0.05,
        type: Sequelize.FLOAT
      },
      fear: {
        defaultValue: 0.05,
        type: Sequelize.FLOAT
      },
      joy: {
        defaultValue: 0.05,
        type: Sequelize.FLOAT
      },
      sadness: {
        defaultValue: 0.05,
        type: Sequelize.FLOAT
      },
      analytical: {
        defaultValue: 0.05,
        type: Sequelize.FLOAT
      },
      confident: {
        defaultValue: 0.05,
        type: Sequelize.FLOAT
      },
      tentative: {
        defaultValue: 0.05,
        type: Sequelize.FLOAT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Feedbacks');
  }
};
