var express = require('express');
var router = express.Router();
var auth = require('../utils/session');
var sequelize = require('sequelize');

var Op = sequelize.Op;

const db = require('../database/models/index');

const { User, QuestionBank, Question } = db;

/* GET home page. */
router.get('/', function(req, res, next) {
  db.sequelize
    .query(`SELECT * FROM "Questions"`)
    .then(results => {
      let questions = results[0];
      questions.reverse();
      questions = questions.slice(0, 3);
      res.render('index', { user: req.session.user, questions });
    })
    .catch(err => res.status(400).send(err));
});

// Gets registration page
router.get('/register', function(req, res, next) {
  res.render('register');
});

// Gets login page
router.get('/login', function(req, res, next) {
  res.render('login');
});

// Process requireLogin middleware here
router.use(auth.requireLogin);

router.get('/username=:username', function(req, res, next) {
  // Gather user's info
  const { username } = req.params;

  return User.findOne({ where: { username } })
    .then(user => {
      QuestionBank.findAll({ where: { UserId: user.id } })
        .then(banks =>
          res.render('user-profile', {
            username: user.username,
            banks
          })
        )
        .catch(err => res.status(400).send(err));
    })
    .catch(err => res.status(400).send(err));
  // Redirect to user's page
});

router.get('/question-banks', function(req, res, next) {
  QuestionBank.findAll({ where: { UserId: req.session.user.id } })
    .then(banks => res.render('question-banks', { banks }))
    .catch(err => res.status(400).send(err));
});

router.get('/history', function(req, res, next) {
  res.render('history');
});

router.get('/practice', function(req, res, next) {
  return QuestionBank.findAll({ where: { UserId: req.session.user.id } })
    .then(banks => res.render('practice', { user: req.session.user, banks }))
    .catch(err => res.status(400).send(err));
});

router.get('/search', function(req, res, next) {
  return User.findAll({})
    .then(users => res.render('search-results', { users }))
    .catch(err => res.status(400).send(err));
});

router.get('/search=:input', function(req, res, next) {
  let { input } = req.params;
  input = input.toLowerCase();

  return User.findAll({
    where: { username: { [Op.iLike]: `%${input}%` } }
  })
    .then(users => res.render('search-results', { users }))
    .catch(err => res.status(400).send(err));
});

router.get('/my-account', function(req, res, next) {
  res.render('my-account', { user: req.session.user });
});

module.exports = router;
