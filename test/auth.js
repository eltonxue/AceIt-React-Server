const test = require('./test.js');
const { chai, server, agent, should } = test;

const db = require('../database/models/index');
const { User } = db;

/*
Test 'auth' route
  - /auth/login POST
  - /auth/register POST
*/

describe('Auth', function() {
  beforeEach(function(done) {
    // Clear all databases
    User.destroy({ where: {} })
      .then(() => {
        const userData = {
          username: 'soniaxu',
          password: '123456789',
          email: 'soniaxu96@gmail.com'
        };

        User.create(userData)
          .then(user => {
            done();
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  });

  // After each test, clear the User database
  afterEach(function(done) {
    // Clear all database
    User.destroy({ where: {} })
      .then(() => {
        done();
      })
      .catch(err => console.log(err));
  });

  // ********* LOGIN ROUTE TESTING **********
  it('Should login and return URL redirect upon success', function(done) {
    chai
      .request(server)
      .post('/auth/login')
      .send({ username: 'soniaxu', password: '123456789' })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('redirect');
        res.body.redirect.should.equal('/');
        done();
      });
  });

  it('Should fail login and return User does not exists error', function(done) {
    chai
      .request(server)
      .post('/auth/login')
      .send({ username: 'eltonxue', password: '123456789' })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('type');
        res.body.should.have.property('error');
        res.body.type.should.equal('username');
        res.body.error.should.equal('User does not exist');
        done();
      });
  });

  it('Should fail login and return incorrect password error', function(done) {
    chai
      .request(server)
      .post('/auth/login')
      .send({ username: 'soniaxu', password: 'abcdefghi' })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('type');
        res.body.should.have.property('error');
        res.body.type.should.equal('password');
        res.body.error.should.equal('Incorrect password');
        done();
      });
  });

  // ********* REGISTRATION ROUTE TESTING **********
  it('Should successfully register and User information', function(done) {
    chai
      .request(server)
      .post('/auth/register')
      .send({
        username: 'milachloe',
        email: 'milachloe@gmail.com',
        password: '123456789',
        confirmPassword: '123456789'
      })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');

        res.body.should.have.property('id');
        res.body.should.have.property('username');
        res.body.should.have.property('password');
        res.body.should.have.property('email');
        res.body.username.should.equal('milachloe');
        res.body.password.should.equal('123456789');
        res.body.email.should.equal('milachloe@gmail.com');
        done();
      });
  });

  it('Should fail registration and return User already exists error', function(done) {
    chai
      .request(server)
      .post('/auth/register')
      .send({
        username: 'soniaxu',
        email: 'milachloe@gmail.com',
        password: '123456789',
        confirmPassword: '123456789'
      })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');

        res.body.should.have.property('type');
        res.body.should.have.property('error');
        res.body.type.should.equal('username');
        res.body.error.should.equal('Username already exists');
        done();
      });
  });

  it('Should fail registration and return email already exists error', function(done) {
    chai
      .request(server)
      .post('/auth/register')
      .send({
        username: 'eltonxue',
        email: 'soniaxu96@gmail.com',
        password: '123456789',
        confirmPassword: '123456789'
      })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');

        res.body.should.have.property('type');
        res.body.should.have.property('error');
        res.body.type.should.equal('email');
        res.body.error.should.equal('Email already exists');
        done();
      });
  });

  it('Should fail login and return Passwords must match error', function(done) {
    chai
      .request(server)
      .post('/auth/register')
      .send({
        username: 'milachloe',
        email: 'milachloe@gmail.com',
        password: 'Mabi123456789',
        confirmPassword: 'Xue123456789'
      })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');

        res.body.should.have.property('type');
        res.body.should.have.property('error');
        res.body.type.should.equal('password');
        res.body.error.should.equal('Passwords must match');
        done();
      });
  });

  it('Should fail login and return Passwords must be > 6 characters error', function(done) {
    chai
      .request(server)
      .post('/auth/register')
      .send({
        username: 'milachloe',
        email: 'milachloe@gmail.com',
        password: 'Xue',
        confirmPassword: 'Xue'
      })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');

        res.body.should.have.property('type');
        res.body.should.have.property('error');
        res.body.type.should.equal('password');
        res.body.error.should.equal('Password must be greater than 6 characters');
        done();
      });
  });
});
