var express = require('express');
var router = express.Router();

const db = require('../database/models/index');

const { User, QuestionBank, Feedback } = db;

// Logs the user in as a session user
router.post('/login', function(req, res, next) {
  const data = req.body;
  User.findOne({ where: { username: data.username } }).then(function(user) {
    if (!user) {
      return res.send({ type: 'username', error: 'User does not exist' });
    } else {
      if (data.password === user.password) {
        // sets a cookie with the user's info
        req.session.user = user;
        return res.send({ redirect: '/' });
      } else {
        return res.send({ type: 'password', error: 'Incorrect password' });
      }
    }
  });
});

// Signs the user up in as a session user
router.post('/register', function(req, res, next) {
  const data = req.body;
  // Check email
  let reg = /\S+@\S+\.\S+/;
  if (!reg.test(data.email)) {
    return res.send({ type: 'email', error: 'Invalid email' });
  } else if (data.password.length <= 6 || data.confirmPassword.length <= 6) {
    return res.send({
      type: 'password',
      error: 'Password must be greater than 6 characters'
    });
  } else if (data.password !== data.confirmPassword) {
    // Check passwords
    return res.send({ type: 'password', error: 'Passwords must match' });
  } else {
    // Check if username or email exists
    User.findOne({ where: { username: data.username } })
      .then(invalidUsername => {
        if (invalidUsername) {
          return res.send({ type: 'username', error: 'Username already exists' });
        } else {
          User.findOne({ where: { email: data.email } })
            .then(invalidEmail => {
              if (invalidEmail) {
                return res.send({ type: 'email', error: 'Email already exists' });
              } else {
                const userData = {
                  username: data.username,
                  password: data.password,
                  email: data.email
                };

                // Create a user given the data (history and questionBanks values created by default)
                return User.create(userData, {
                  include: [{ model: QuestionBank, as: 'QuestionBanks' }, { model: Feedback, as: 'Feedbacks' }]
                })
                  .then(user => res.send(user))
                  .catch(err => res.status(400).send(err));
              }
            })
            .catch(err => res.status(400).send(err));
        }
      })
      .catch(err => res.status(400).send(err));
  }
});

// Logs the user out of their session
router.get('/logout', function(req, res, next) {
  req.session.reset();
  res.redirect('/');
});

module.exports = router;
