'use strict';
var express = require('express');
var {Index} = require('../models/index');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  let my_index = new Index('Hello from Model-World','Here is nice, fresh content');
  res.render('index', my_index);
});

module.exports = router;
