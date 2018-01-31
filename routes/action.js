var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');
var fs = require('fs');
var axios = require('axios');
var multer = require('multer');
var upload = multer({ dest: './public/recordings' });
var socketio = require('../socketio');

var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

const db = require('../database/models/index');

const { User, QuestionBank, Feedback, Question } = db;

// Update password
router.patch('/update-password', function(req, res, next) {
  const data = req.body;
  if (data.newPassword.length <= 6 || data.confirmNewPassword.length <= 6) {
    return res.send({
      type: 'new-password',
      error: 'Passwords must be greater than 6 characters'
    });
  } else if (data.newPassword !== data.confirmNewPassword) {
    return res.send({ type: 'new-password', error: 'Passwords must match' });
  }
  if (req.session.user.password !== data.oldPassword) {
    return res.send({ type: 'old-password', error: 'Wrong password' });
  } else {
    User.update(
      { password: data.newPassword },
      {
        where: { username: req.session.user.username },
        returning: true,
        plain: true
      }
    )
      .then(results => {
        req.session.user.password = data.newPassword;
        return res.send(results[1].dataValues);
      })
      .catch(err => res.status(400).send(err));
  }
});

// Add new Feedback to history
router.post('/feedback', function(req, res, next) {
  const data = req.body;

  db.sequelize
    .query(
      `INSERT INTO "Feedbacks"("question","UserId", "createdAt", "updatedAt") VALUES ('it works!!!', ${req.session.user
        .id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
      { type: sequelize.QueryTypes.INSERT }
    )
    .then(results => res.send(results[0][0]))
    .catch(err => res.status(400).send(err));
});

router.patch('/feedback/api', upload.single('blob'), function(req, res, next) {
  const sockets = socketio.sockets();
  const sessionSocket = sockets[req.session.user.id];

  const data = req.body;

  const filePath = `${__dirname}/../public/recordings/${data.name}.flac`;

  fs.renameSync(`${__dirname}/../public/recordings/${req.file.filename}`, filePath);

  // Retrieves data from API
  var speech_to_text = new SpeechToTextV1({
    username: '6a88e235-4937-46cd-8f93-646fccbea760',
    password: 'LvDs4WmdjNH2'
  });
  let params = {
    content_type: 'audio/wav'
  };

  var recognizeStream = speech_to_text.createRecognizeStream(params);

  fs.createReadStream(filePath).pipe(recognizeStream);

  recognizeStream.pipe(fs.createWriteStream('./public/recordings/transcription.txt'));

  recognizeStream.setEncoding('utf8'); // to get strings instead of Buffers from `data` events

  // Send session user's socket to 'Converting Audio To Text'
  sessionSocket.emit('progress', 'Converting Audio To Text', '80%');

  let transcript = '';
  ['data', 'error', 'close'].forEach(function(eventName) {
    recognizeStream.on(eventName, function(results) {
      if (eventName === 'data') {
        transcript += results;
      } else if (eventName === 'close') {
        // READ FROM TRANSCRIPT FILE
        let arr = transcript.split(' ');
        arr = arr.map((current, i) => {
          // Average sentence length = 7, 10, 14
          return i % 7 === 0 && i !== 0 ? `${current}.` : current;
        });

        transcript = arr.join(' ');

        // Send session user's socket to 'Analyzing Text Tone'
        sessionSocket.emit('progress', 'Analyzing Text Tone', '90%');

        var tone_analyzer = new ToneAnalyzerV3({
          username: '8be17060-7d16-4dde-b8db-2f789916806c',
          password: 'pxQuQ0lbWszM',
          version_date: '2017-09-21'
        });

        tone_analyzer.tone(
          {
            tone_input: transcript ? transcript : ' ',
            content_type: 'text/plain'
          },
          function(err, results) {
            let parsedTones = {
              Anger: 0.05,
              Fear: 0.05,
              Joy: 0.05,
              Sadness: 0.05,
              Analytical: 0.05,
              Confident: 0.05,
              Tentative: 0.05
            };
            if (err) {
              // Send default
              return res.send(parsedTones);
            } else {
              let tones = results.document_tone.tones;

              tones.forEach(function(tone) {
                parsedTones[tone.tone_name] = tone.score;
              });

              const nameSplit = data.name.split('-');
              const feedbackId = nameSplit[1];
              db.sequelize
                .query(
                  `UPDATE "Feedbacks" SET ("path", "question", "anger","fear","joy","sadness","analytical","confident","tentative","updatedAt") = ('${filePath}', '${data.question}', ${parsedTones.Anger}, ${parsedTones.Fear}, ${parsedTones.Joy}, ${parsedTones.Sadness}, ${parsedTones.Analytical}, ${parsedTones.Confident}, ${parsedTones.Tentative}, CURRENT_TIMESTAMP) WHERE id = ${feedbackId} RETURNING *`,
                  { type: sequelize.QueryTypes.UPDATE }
                )
                .then(feedback => {
                  db.sequelize
                    .query(
                      `INSERT INTO "Questions"("username", "question", "createdAt", "updatedAt") VALUES ('${req.session
                        .user.username}', '${data.question}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
                      { type: sequelize.QueryTypes.INSERT }
                    )
                    .then(results => {
                      // Send all sockets updated question
                      socketio.instance().emit('new question', req.session.user.username, data.question);
                      // Send session user's socket to 'Complete'
                      sessionSocket.emit('progress', 'Complete', '100%');
                      res.json(parsedTones);
                    })
                    .catch(err => res.status(400).send(err));
                })
                .catch(err => res.status(400).send(err));
            }
          }
        );
      }
    });
  });
});

// Delete all history with session user's ID
router.delete('/feedback/clear', function(req, res, next) {
  db.sequelize
    .query(`DELETE FROM "Feedbacks" WHERE "UserId" = ${req.session.user.id} RETURNING *`)
    .then(feedbacks => res.send(feedbacks))
    .catch(err => res.status(400).send(err));
});

// Add new Question Bank
router.post('/bank', function(req, res, next) {
  const data = req.body;
  return QuestionBank.create({
    UserId: req.session.user.id,
    title: data.title,
    questions: data.questions
  })
    .then(bank => res.send(bank))
    .catch(err => res.status(400).send(err));
});

// Delete Question Bank w/ bank id
router.delete('/bank', function(req, res, next) {
  const { bankId } = req.query;

  return QuestionBank.destroy({ where: { id: bankId } })
    .then(results => res.send({ numberDeleted: results }))
    .catch(err => res.status(400).send(err));
});

// Update question bank title w/ bank id
router.patch('/bank/update-title', function(req, res, next) {
  const data = req.body;
  const { bankId, newTitle } = data;
  return QuestionBank.update({ title: newTitle }, { where: { id: bankId }, returning: true, plain: true })
    .then(results => res.send(results[1].dataValues))
    .catch(err => res.status(400).send(err));
});

// Add question to question bank w/ bank id
router.patch('/bank/add-question', function(req, res, next) {
  const data = req.body;
  const { bankId, question } = data;

  return QuestionBank.update(
    {
      questions: sequelize.fn('array_append', sequelize.col('questions'), question)
    },
    { where: { id: bankId }, returning: true, plain: true }
  )
    .then(results => res.send(results[1].dataValues))
    .catch(err => res.status(400).send(err));
});

// Remove question from question bank w/ bank id
router.patch('/bank/remove-question', function(req, res, next) {
  const data = req.body;
  const { bankId, question } = data;

  return QuestionBank.findById(bankId)
    .then(bank => {
      let questions = bank.questions;
      questions.splice(questions.indexOf(question), 1);
      QuestionBank.update({ questions }, { where: { id: bankId }, returning: true, plain: true })
        .then(results => res.send(results[1].dataValues))
        .catch(err => res.status(400).send(err));
    })
    .catch(err => res.status(400).send(err));
});

module.exports = router;
