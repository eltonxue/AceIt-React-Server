var fs = require('fs');
const test = require('./test.js');
const { chai, server, agent, should } = test;

const db = require('../database/models/index');
const { User, QuestionBank, Feedback, Question } = db;

/*
Test 'actions' route
  - /action/update-password PATCH
  - /action/feedback POST
  - /action/feedback/api PATCH
  - /action/feedback/clear DELETE
  - /action/bank POST
  - /action/bank DELETE
  - /action/bank/update-title PATCH
  - /action/bank/add-question PATCH
  - /action/bank/remove-question PATCH
*/

describe('Users', function() {
  // Clear all database
  // before each test, run this
  beforeEach(function(done) {
    QuestionBank.destroy({ where: {} })
      .then(() => {
        Feedback.destroy({ where: {} })
          .then(() => {
            User.destroy({ where: {} })
              .then(() => {
                const userData = {
                  username: 'soniaxu',
                  password: '123456789',
                  email: 'soniaxu96@gmail.com',
                  id: 1
                };

                // Creates a session user and then logs them in using chaiHttp's 'agent' feature
                User.create(userData, {
                  include: [{ model: QuestionBank, as: 'QuestionBanks' }, { model: Feedback, as: 'Feedbacks' }]
                })
                  .then(user => {
                    agent
                      .post('/auth/login')
                      .send({ username: user.username, password: user.password })
                      .end((err, res) => {
                        if (err) throw err;

                        // Create a feedback for session user
                        const feedbackData = {
                          UserId: user.id,
                          path: './test.flac',
                          question: 'How well do you work in a team?',
                          anger: 0.33,
                          fear: 0.05,
                          joy: 0.88,
                          sadness: 0.99,
                          analytical: 0.05,
                          tentative: 0.12,
                          id: 1000
                        };

                        // Create 3 question banks for session user
                        const bankData = {
                          UserId: user.id,
                          title: 'Team Questions',
                          questions: ['Are you a leader?', 'Are you a follower?', 'How well do you work in a team?'],
                          id: 1000
                        };

                        const bankData2 = {
                          UserId: user.id,
                          title: 'Technical Questions',
                          questions: ['Which project on your resume are you most proud of?'],
                          id: 2000
                        };

                        const bankData3 = {
                          UserId: user.id,
                          title: 'Behavioral Questions',
                          questions: ['Tell me about yourself.', 'Why do you want to work for us?'],
                          id: 3000
                        };

                        Feedback.create(feedbackData)
                          .then(() => {
                            QuestionBank.create(bankData)
                              .then(() => {
                                QuestionBank.create(bankData2)
                                  .then(() => {
                                    QuestionBank.create(bankData3)
                                      .then(() => {
                                        done();
                                      })
                                      .catch(err => console.log(err));
                                  })
                                  .catch(err => console.log(err));
                              })
                              .catch(err => console.log(err));
                          })
                          .catch(err => console.log(err));
                      });
                  })
                  .catch(err => console.log(err));
              })
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  });

  // After each test, clear the User database
  afterEach(function(done) {
    QuestionBank.destroy({ where: {} })
      .then(() => {
        Feedback.destroy({ where: {} })
          .then(() => {
            User.destroy({ where: {} })
              .then(() => {
                done();
              })
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  });

  it('Should fail PATCH and return Password must be > 6 characters error', function(done) {
    agent
      .patch('/action/update-password')
      .send({ oldPassword: '123456789', newPassword: '9876', confirmNewPassword: '9876' })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('type');
        res.body.should.have.property('error');
        res.body.type.should.equal('new-password');
        res.body.error.should.equal('Passwords must be greater than 6 characters');
        done();
      });
  });

  it('Should fail PATCH and return Passwords must match error', function(done) {
    agent
      .patch('/action/update-password')
      .send({ oldPassword: '123456789', newPassword: 'abcdefghi', confirmNewPassword: '987654321' })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('type');
        res.body.should.have.property('error');
        res.body.type.should.equal('new-password');
        res.body.error.should.equal('Passwords must match');
        done();
      });
  });

  it('Should fail PATCH and return Wrong password error', function(done) {
    agent
      .patch('/action/update-password')
      .send({ oldPassword: 'abcdefghi', newPassword: '987654321', confirmNewPassword: '987654321' })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('type');
        res.body.should.have.property('error');
        res.body.type.should.equal('old-password');
        res.body.error.should.equal('Wrong password');
        done();
      });
  });

  it('Should successfully PATCH and update password for session user', function(done) {
    agent
      .patch('/action/update-password')
      .send({ oldPassword: '123456789', newPassword: '987654321', confirmNewPassword: '987654321' })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('id');
        res.body.should.have.property('username');
        res.body.should.have.property('password');
        res.body.should.have.property('email');
        res.body.should.have.property('createdAt');
        res.body.should.have.property('updatedAt');
        res.body.username.should.equal('soniaxu');
        res.body.password.should.equal('987654321');
        res.body.email.should.equal('soniaxu96@gmail.com');
        done();
      });
  });

  it('Should successfully POST and return new inserted Feedback instance', function(done) {
    agent.post('/action/feedback').end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('object');

      const feedback = res.body;

      feedback.should.have.property('UserId');
      feedback.should.have.property('id');
      feedback.should.have.property('path');
      feedback.should.have.property('question');
      feedback.should.have.property('anger');
      feedback.should.have.property('fear');
      feedback.should.have.property('joy');
      feedback.should.have.property('sadness');
      feedback.should.have.property('analytical');
      feedback.should.have.property('confident');
      feedback.should.have.property('tentative');
      feedback.should.have.property('createdAt');
      feedback.should.have.property('updatedAt');

      feedback.path.should.equal('/');
      feedback.question.should.equal('it works!!!');
      feedback.anger.should.equal(0.05);
      feedback.fear.should.equal(0.05);
      feedback.joy.should.equal(0.05);
      feedback.sadness.should.equal(0.05);
      feedback.analytical.should.equal(0.05);
      feedback.confident.should.equal(0.05);
      feedback.tentative.should.equal(0.05);

      done();
    });
  });

  it('Should fail POST and fail to update Feedback instance', function(done) {
    // Test if file upload fails (Blobs uploaded are created dynamically)
    agent
      .post('/action/feedback/api')
      .field('name', '1-1')
      .field('question', 'How well do you work in a team?')
      .field('Content-Type', 'multipart/form-data')
      .attach('blob', fs.readFileSync(`${__dirname}/../test/test.flac`), './test.flac')
      .end(function(err, res) {
        res.should.have.status(404);
        done();
      });
  });

  it('Should successfully DELETE and return array of Feedback deleted', function(done) {
    agent.delete('/action/feedback/clear').end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json;

      const feedbacks = res.body[0];

      feedbacks.forEach(feedback => {
        feedback.should.have.property('UserId');
        feedback.should.have.property('id');
        feedback.should.have.property('path');
        feedback.should.have.property('question');
        feedback.should.have.property('anger');
        feedback.should.have.property('fear');
        feedback.should.have.property('joy');
        feedback.should.have.property('sadness');
        feedback.should.have.property('analytical');
        feedback.should.have.property('confident');
        feedback.should.have.property('tentative');
        feedback.should.have.property('createdAt');
        feedback.should.have.property('updatedAt');
      });

      const feedback = res.body[0][0];

      feedback.UserId.should.equal(1);
      feedback.id.should.equal(1000);
      feedback.path.should.equal('./test.flac');
      feedback.question.should.equal('How well do you work in a team?');
      feedback.anger.should.equal(0.33);
      feedback.fear.should.equal(0.05);
      feedback.joy.should.equal(0.88);
      feedback.sadness.should.equal(0.99);
      feedback.analytical.should.equal(0.05);
      feedback.confident.should.equal(0.05);
      feedback.tentative.should.equal(0.12);

      done();
    });
  });

  it('Should successfully POST and return new inserted QuestionBank instance', function(done) {
    agent
      .post('/action/bank')
      .send({ title: 'Personal Questions', questions: ['What are some of your hobbies?'] })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');

        const bank = res.body;

        bank.should.have.property('UserId');
        bank.should.have.property('id');
        bank.should.have.property('title');
        bank.should.have.property('questions');

        bank.UserId.should.equal(1);
        bank.title.should.equal('Personal Questions');
        bank.questions.should.have.lengthOf(1);
        bank.questions.indexOf('What are some of your hobbies?').should.not.equal(-1);

        done();
      });
  });

  it('Should successfully DELETE and return removed QuestionBank instance', function(done) {
    agent.delete('/action/bank?bankId=1000').end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('object');
      res.body.should.have.property('numberDeleted');
      res.body.numberDeleted.should.equal(1);

      done();
    });
  });

  it('Should successfully PATCH and return updated QuestionBank instance w/ updated title', function(done) {
    agent
      .patch('/action/bank/update-title')
      .send({ bankId: 1000, newTitle: 'Updated Team Questions' })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;

        const bank = res.body;

        bank.should.have.property('id');
        bank.should.have.property('title');
        bank.should.have.property('questions');
        bank.should.have.property('createdAt');
        bank.should.have.property('updatedAt');
        bank.should.have.property('UserId');
        bank.UserId.should.equal(1);
        bank.id.should.equal(1000);
        bank.title.should.equal('Updated Team Questions');
        bank.questions[0].should.equal('Are you a leader?');
        bank.questions[1].should.equal('Are you a follower?');
        bank.questions[2].should.equal('How well do you work in a team?');
        bank.questions.should.have.lengthOf(3);

        done();
      });
  });

  it('Should successfully PATCH and return updated QuestionBank instance w/ added question', function(done) {
    agent
      .patch('/action/bank/add-question')
      .send({
        bankId: 1000,
        question: 'Tell me about a time where you had to deal with confrontation from a team member.'
      })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;

        const bank = res.body;

        bank.should.have.property('id');
        bank.should.have.property('title');
        bank.should.have.property('questions');
        bank.should.have.property('createdAt');
        bank.should.have.property('updatedAt');
        bank.should.have.property('UserId');
        bank.UserId.should.equal(1);
        bank.id.should.equal(1000);
        bank.title.should.equal('Team Questions');
        bank.questions[0].should.equal('Are you a leader?');
        bank.questions[1].should.equal('Are you a follower?');
        bank.questions[2].should.equal('How well do you work in a team?');
        bank.questions[3].should.equal(
          'Tell me about a time where you had to deal with confrontation from a team member.'
        );
        bank.questions.should.have.lengthOf(4);

        done();
      });
  });

  it('Should successfully PATCH and return updated QuestionBank instance w/ removed question', function(done) {
    agent
      .patch('/action/bank/remove-question')
      .send({ bankId: 1000, question: 'Are you a leader?' })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;

        const bank = res.body;

        bank.should.have.property('id');
        bank.should.have.property('title');
        bank.should.have.property('questions');
        bank.should.have.property('createdAt');
        bank.should.have.property('updatedAt');
        bank.should.have.property('UserId');
        bank.UserId.should.equal(1);
        bank.id.should.equal(1000);
        bank.title.should.equal('Team Questions');
        bank.questions[0].should.equal('Are you a follower?');
        bank.questions[1].should.equal('How well do you work in a team?');
        bank.questions.should.have.lengthOf(2);

        done();
      });
  });
});
