const assert = require('assert/strict');
const mocha = require('mocha');

const {Index} = require('../models/index');

beforeEach(function() {
  return my_index = new Index('A Title', 'A Piece of Content');
});

describe('Index', function() {
  describe('#new', function() {
    it('should preserve its constructor values', function() {
      assert.equal('A Title', my_index.title);
      assert.equal('A Piece of Content', my_index.content);
    });
  });
  describe('.json', function() {
    it('should present a JSON string of the constructor values', function() {
      assert.equal(
        '{"title":"A Title","content":"A Piece of Content"}',
        my_index.json
      );
    });
  });
});