'use strict';
/* global describe, it */
const assert = require('assert/strict');
const cv = require('../lib/chicago-vax');

describe('dateFromDaysAgo', function() {
  it('should return a date in the past', function() {
    assert(new Date().toISOString() > cv.dateFromDaysAgo(7), 'date is not in the past');
  });
  it('should return a zeroed-out time value', function() {
    assert.equal('00:00:00.000', cv.dateFromDaysAgo(7).split('T')[1], 'time value is not zeroed out');
  });
});

describe('buildLogMessage', function() {
  it('should return a log message as expected', function() {
    const now = new Date().toISOString();
    const type = "ERROR";
    const message = "Actually not an error. Just testing!";
    assert.equal(`${now} - ${type}: ${message}`, cv.buildLogMessage(now, message, type), 'log message not as expected');
  });
});
