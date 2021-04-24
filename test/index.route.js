const assert = require('assert');
const cheerio = require('cheerio');
// See https://www.npmjs.com/package/supertest
// Used for making requests on the ExpressJS app
const request = require('supertest');
const app = require('../app');
const {seedDatabase, destroyDatabase} = require('../db/seed');

describe('Web requests on the app', function() {

  before(async function() {
    // set up the database
    await seedDatabase();
  });
  after(async function() {
    // destroy the database
    await destroyDatabase();
  });

  it('should return an expected GET / response', function() {
    return request(app)
      .get('/')
      .expect(200)
      .then(function(response) {
        const $ = cheerio.load(response.text);
        assert.equal($('tbody tr').length, 60, 'expected 60 rows');
      });
  });

  it('should return an expected GET /60616 response', function() {
    return request(app)
      .get('/60616')
      .expect(200)
      .then(function(response) {
        const $ = cheerio.load(response.text);
        assert.equal($('tbody tr').length, 10, 'expected 10 rows');
        assert.equal($('h2 + p').text(), 'Population: 54197', 'expected "Population: 54197"');
      });
  });

  it('should return an expected GET /60616/5 response', function() {
    return request(app)
      .get('/60616/5')
      .expect(200)
      .then(function(response) {
        const $ = cheerio.load(response.text);
        assert.equal($('tbody tr').length, 5, 'expected 5 rows');
        assert.equal($('h2 + p').text(), 'Population: 54197', 'expected "Population: 54197"');
      });
  });

});
