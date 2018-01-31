var express = require('express');
var router = express.Router();

router.get('/:misc', function(req, res, next) {
  res.redirect('/');
});

module.exports = router;
