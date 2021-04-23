'use strict';
const express = require('express');
const {Record} = require('../models/record');
const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res) {
  // let my_index = new Index('Hello from Model-World', 'Here is nice, fresh content');
  const r = new Record();
  const items = await r.items();
  console.log(`${items.length} items`);
  res.json(items);
});

router.get('/:zip([0-9]{5}|Unknown)/:days([0-9]+)?', async function(req, res) {
  // let my_index = new Index('Hello from Model-World', 'Here is nice, fresh content');
  const zip = req.params.zip;
  const days = Number.parseInt(req.params.days) ?? 10;
  const r = new Record(zip, days);
  const items = await r.items();
  console.log(`${items.length} items`);
  res.json(items);
});

module.exports = router;
