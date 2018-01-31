'use strict';
module.exports = (sequelize, DataTypes) => {
  var Feedback = sequelize.define('Feedback', {
    path: {
      type: DataTypes.STRING,
      default: '/'
    },
    question: {
      type: DataTypes.STRING,
      defaultValue: 'Example Feedback'
    },
    anger: {
      type: DataTypes.FLOAT,
      defaultValue: 0.05
    },
    fear: {
      type: DataTypes.FLOAT,
      defaultValue: 0.05
    },
    joy: {
      type: DataTypes.FLOAT,
      defaultValue: 0.05
    },
    sadness: {
      type: DataTypes.FLOAT,
      defaultValue: 0.05
    },
    analytical: {
      type: DataTypes.FLOAT,
      defaultValue: 0.05
    },
    confident: {
      type: DataTypes.FLOAT,
      defaultValue: 0.05
    },
    tentative: {
      type: DataTypes.FLOAT,
      defaultValue: 0.05
    }
  });

  Feedback.associate = function(models) {
    // associations can be defined here
    Feedback.belongsTo(models.User);
  };
  return Feedback;
};
