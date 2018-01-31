process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var server = require('../app');
var should = chai.should();
var agent = chai.request.agent(server);

module.exports = {
  chai,
  agent,
  server,
  should
};
