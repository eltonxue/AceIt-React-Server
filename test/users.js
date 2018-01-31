const test = require('./test.js');
const { chai, server, agent, should } = test;

const db = require('../database/models/index');
const { User, QuestionBank, Feedback, Question } = db;

/*
Test 'users' route
  - /users/history GET
  - /users/bank=:bankId GET
  - /users/banks GET
  - /users/banks/search=:input GET
*/

describe('Users', function() {
  // Before each test, run this
  beforeEach(function(done) {
    // Clear all databases
    QuestionBank.destroy({ where: {} })
      .then(() => {
        Feedback.destroy({ where: {} })
          .then(() => {
            User.destroy({ where: {} })
              .then(() => {
                const userData = {
                  username: 'soniaxu',
                  password: '123456789',
                  email: 'soniaxu96@gmail.com'
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
                          path: '../test.flac',
                          question: 'How well do you work in a team?',
                          anger: 0.33,
                          fear: 0.05,
                          joy: 0.88,
                          sadness: 0.99,
                          analytical: 0.05,
                          tentative: 0.12,
                          id: 1
                        };

                        // Create 3 question banks for session user
                        const bankData = {
                          UserId: user.id,
                          title: 'Team Questions',
                          questions: ['Are you a leader?', 'Are you a follower?', 'How well do you work in a team?'],
                          id: 1
                        };

                        const bankData2 = {
                          UserId: user.id,
                          title: 'Technical Questions',
                          questions: ['Which project on your resume are you most proud of?'],
                          id: 2
                        };

                        const bankData3 = {
                          UserId: user.id,
                          title: 'Behavioral Questions',
                          questions: ['Tell me about yourself.', 'Why do you want to work for us?'],
                          id: 3
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

  it('Should successfully GET all feedback history of session user', function(done) {
    agent.get('/users/history').end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json;

      const feedback = res.body[0];

      feedback.should.have.property('UserId');
      feedback.should.have.property('id');
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
      feedback.should.have.property('audio');

      feedback.id.should.equal(1);
      feedback.question.should.equal('How well do you work in a team?');
      feedback.anger.should.equal(0.33);
      feedback.fear.should.equal(0.05);
      feedback.joy.should.equal(0.88);
      feedback.sadness.should.equal(0.99);
      feedback.analytical.should.equal(0.05);
      feedback.confident.should.equal(0.05);
      feedback.tentative.should.equal(0.12);
      feedback.audio.should.equal('File does not exist');

      done();
    });
  });

  it('Should successfully GET question bank with bankId', function(done) {
    agent.get('/users/bank=1').end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json;

      res.body.id.should.equal(1);
      res.body.title.should.equal('Team Questions');
      res.body.questions.should.have.lengthOf(3);
      res.body.questions.indexOf('Are you a leader?').should.not.equal(-1);
      res.body.questions.indexOf('Are you a follower?').should.not.equal(-1);
      res.body.questions.indexOf('How well do you work in a team?').should.not.equal(-1);

      done();
    });
  });

  it('Should successfully GET all question banks of session user', function(done) {
    agent.get('/users/banks').end(function(err, res) {
      res.should.have.status(200);
      res.should.be.json;
      res.body.forEach(bank => {
        bank.should.have.property('id');
        bank.should.have.property('title');
        bank.should.have.property('questions');
        bank.should.have.property('createdAt');
        bank.should.have.property('updatedAt');
        bank.should.have.property('UserId');
      });

      const bank1 = res.body[0];
      const bank2 = res.body[1];
      const bank3 = res.body[2];

      bank1.id.should.equal(1);
      bank1.title.should.equal('Team Questions');
      bank1.questions.should.have.lengthOf(3);
      bank1.questions.indexOf('Are you a leader?').should.not.equal(-1);
      bank1.questions.indexOf('Are you a follower?').should.not.equal(-1);
      bank1.questions.indexOf('How well do you work in a team?').should.not.equal(-1);
      bank2.id.should.equal(2);
      bank2.title.should.equal('Technical Questions');
      bank2.questions.should.have.lengthOf(1);
      bank2.questions.indexOf('Which project on your resume are you most proud of?').should.not.equal(-1);
      bank3.id.should.equal(3);
      bank3.title.should.equal('Behavioral Questions');
      bank3.questions.should.have.lengthOf(2);
      bank3.questions.indexOf('Tell me about yourself.').should.not.equal(-1);
      bank3.questions.indexOf('Why do you want to work for us?').should.not.equal(-1);

      done();
    });

    it('Should successfully GET all question banks of session user that fit search input', function(done) {
      agent.get('/users/banks/search=Te').end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.forEach(bank => {
          bank.should.have.property('id');
          bank.should.have.property('title');
          bank.should.have.property('questions');
          bank.should.have.property('createdAt');
          bank.should.have.property('updatedAt');
          bank.should.have.property('UserId');
        });

        const bank1 = res.body[0];
        const bank2 = res.body[1];

        bank1.id.should.equal(1);
        bank1.title.should.equal('Team Questions');
        bank1.questions.should.have.lengthOf(3);
        bank1.questions.indexOf('Are you a leader?').should.not.equal(-1);
        bank1.questions.indexOf('Are you a follower?').should.not.equal(-1);
        bank1.questions.indexOf('How well do you work in a team?').should.not.equal(-1);
        bank2.id.should.equal(2);
        bank2.title.should.equal('Technical Questions');
        bank2.questions.should.have.lengthOf(1);
        bank2.questions.indexOf('Which project on your resume are you most proud of?').should.not.equal(-1);

        done();
      });
    });
  });
});
