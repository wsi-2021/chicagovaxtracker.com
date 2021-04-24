'use strict';

const mdb = require('../db/connect');

class Record {
  constructor(zip = 'all', days = 1) {
    this.zip = zip;
    this.days = days;
    if (this.zip == 'all') {
      this.query = {};
      this.limit = 60;
    } else {
      this.query = {zip_code: this.zip};
      if (this.days == 'all') {
        this.limit = 0;
      } else {
        this.limit = Number.parseInt(this.days);
      }
    }
  }
  async items() {
    let items;
    try {
      const connection = await mdb.connect();
      const db = connection.db(`${process.env.NODE_ENV}--vax-data`);
      const collection = db.collection('by_zip');
      const cursor = collection.find(this.query, {sort: [['date',-1],['zip_code',1]], limit: this.limit});
      items = await cursor.toArray();
    } catch(e) {
      console.error(e);
    }
    return items;
  }
}

module.exports = {
  Record
}
