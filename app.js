var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var cors = require('cors');

var index = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var action = require('./routes/action');
var redirect = require('./routes/redirect');

var app = express();

const User = require('./database/models/index').User;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Handling user sessions
app.use(
  session({
    cookieName: 'session',
    secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8', // Encrypted string
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true, // Not accessible through javascript
    secure: true, // Cookie only sent through SSL
    ephemeral: true // Deletes cookies when browser closes
  })
);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    User.findOne({ where: { email: req.session.user.email } }).then(function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user; //refresh the session value
        res.locals.user = user;
      }
      next();
    });
  } else {
    next();
  }
});

app.use('/auth', auth);
app.use('/', index);
app.use('/users', users);
app.use('/action', action);
// Redirects to index page if does not fit any preassigned routes while logged in
app.use('/', redirect);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
