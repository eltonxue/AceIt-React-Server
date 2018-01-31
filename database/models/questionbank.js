'use strict';
module.exports = (sequelize, DataTypes) => {
  var QuestionBank = sequelize.define('QuestionBank', {
    title: {
      allowNull: false,
      type: DataTypes.STRING
    },
    questions: {
      defaultValue: [],
      type: DataTypes.ARRAY(DataTypes.STRING)
    }
  });

  QuestionBank.associate = function(models) {
    // associations can be defined here
    QuestionBank.belongsTo(models.User);
  };

  return QuestionBank;
};
