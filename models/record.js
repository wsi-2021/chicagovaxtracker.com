'use strict';

const mdb = require('../db/connect');

class Record {
  constructor(zip = 'all', days = 1, limit = 60) {
    this.zip = zip;
    this.days = days;
    this.limit = limit;
    if (this.zip == 'all') {
      this.query = {};
      this.limit = 60;
    } else {
      this.query = {zip_code: this.zip};
      this.limit = this.days;
    }
  }
  async items() {
    let items;
    try {
      const connection = await mdb.connect();
      const db = connection.db(`${process.env.NODE_ENV}--vax-data`);
      const collection = db.collection('by_zip');
      // The variables on the query are:
      //   - the zip code (if it exists, aka isn't "all")
      //   - the limit (60 on 'all', requested as such on per-zip; default 10, 30, 0 [all])
      // Per zip-code
      // const cursor = collection.find({zip_code: "60641"}, {sort: [['date',-1],['zip_code',1]], limit: 10});
      // Latest, all zip codes; the limit ensures the 59 Chicago Zips + Unknown
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
