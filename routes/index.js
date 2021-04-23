'use strict';
const express = require('express');
const {Index} = require('../models/index');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  let my_index = new Index('Hello from Model-World', 'Here is nice, fresh content');
  res.render('index', my_index);
});

module.exports = router;
