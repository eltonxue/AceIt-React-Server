var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');
var fs = require('fs');

var Op = sequelize.Op;

const db = require('../database/models/index');

const { User, QuestionBank, Feedback } = db;

// Get session user's history ordered based on date
router.get('/history', function(req, res, next) {
  // Get all feedback with session user's ID

  db.sequelize
    .query(`SELECT * FROM "Feedbacks" WHERE "UserId" = ${req.session.user.id}`, {
      type: sequelize.QueryTypes.SELECT
    })
    .then(history => {
      // Replace history with buffer/stream
      let results = history.map(function(feedback) {
        try {
          feedback.audio = fs.readFileSync(feedback.path);
        } catch (err) {
          feedback.audio = 'File does not exist';
          // Catch if file/directory does not exist
        } finally {
          delete feedback.path;
          return feedback;
        }
      });
      res.json(results);
    })
    .catch(err => res.status(400).send(err));
});

// Get session user's question banks
router.get('/bank=:bankId', function(req, res, next) {
  const { bankId } = req.params;
  return QuestionBank.findOne({
    where: { id: bankId }
  })
    .then(bank => res.send(bank))
    .catch(err => res.status(400).send(err));
});

// Get session user's question banks
router.get('/banks', function(req, res, next) {
  return QuestionBank.findAll({ where: { UserId: req.session.user.id } })
    .then(banks => res.send(banks))
    .catch(err => res.status(400).send(err));
});

// Get session user's question banks based on input
router.get('/banks/search=:input', function(req, res, next) {
  let { input } = req.params;
  input = input.toLowerCase();

  QuestionBank.findAll({
    where: { UserId: req.session.user.id, title: { [Op.iLike]: `%${input}%` } }
  })
    .then(banks => res.send(banks))
    .catch(err => res.status(400).send(err));
});

module.exports = router;
