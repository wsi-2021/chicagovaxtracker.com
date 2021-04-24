const assert = require('assert');
// See https://www.npmjs.com/package/supertest
// Used for making requests on the ExpressJS app
const request = require('supertest');
const app = require('../app');
const {seedDatabase, destroyDatabase} = require('../db/seed');

describe('API requests on the app', function() {

  before(async function() {
    // set up the database
    await seedDatabase();
  });
  after(async function() {
    // destroy the database
    await destroyDatabase();
  });

  it('should return an expected GET /api/ response', function() {
    return request(app)
      .get('/api/')
      .expect(200)
      .then(function(response) {
        assert.equal(60, response.body.length, 'expected 60 records');
      });
  });

  it('should return an expected GET /api/60616 response', function() {
    return request(app)
      .get('/api/60616')
      .expect(200)
      .then(function(response) {
        assert.equal(10, response.body.length, 'expected 10 records');
        assert.equal('60616', response.body[0].zip_code, 'expected 60616 zip_code');
        assert.equal('54197', response.body[0].population, 'expected 54197 population');
      });
  });

  it('should return an expected GET /api/60616/5 response', function() {
    return request(app)
      .get('/api/60616/5')
      .expect(200)
      .then(function(response) {
        assert.equal(5, response.body.length, 'expected 5 records');
        assert.equal('60616', response.body[0].zip_code, 'expected 60616 zip_code');
        assert.equal('54197', response.body[0].population, 'expected 54197 population');
      });
  });

});
