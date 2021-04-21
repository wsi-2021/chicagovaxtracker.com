'use strict';
const fetch = require('node-fetch');
const fs = require('fs/promises');
const path = require('path');
// https://dev.socrata.com/docs/app-tokens.html
const { VAX_APP_TOKEN } = process.env;
const fetch_options = {
  headers: {
    'X-App-Token': VAX_APP_TOKEN
  }
};

function buildFullQuery(days, records, offset = 0) {
  const base_url = 'https://data.cityofchicago.org/resource/553k-3xzc.json';
  const select = `SELECT row_id AS _id, zip_code, date, total_doses_daily, total_doses_cumulative, _1st_dose_daily, _1st_dose_cumulative, _1st_dose_percent_population, vaccine_series_completed_daily, vaccine_series_completed_cumulative, vaccine_series_completed_percent_population, population`;
  const order_by = ` ORDER BY _id DESC`;
  // Limit should be determined by number of days
  const limit = `OFFSET ${offset} LIMIT ${records}`;
  let where = ``;
  if (Number.isInteger(days)) {
    where = ` WHERE date > "${dateFromDaysAgo(days)}"`;
  }
  const full_query = `${select} ${where} ${order_by} ${limit}`;
  return `${base_url}?$query=${encodeURIComponent(full_query)}`;
}

function buildLogMessage(date, message, type) {
  let full_message = `${date} - ${type}: ${message}\n`;
  if (!type) {
    full_message = `${date} - ${message}\n`;
  }
  return full_message;
}

function dateFromDaysAgo(days_ago) {
  var start_date = new Date(new Date().setDate(new Date().getDate() - days_ago));
  return `${start_date.toISOString().split('T')[0]}T00:00:00.000`;
}

function debug_message(func, message) {
  if (process.env.DEBUG) func.call(null, message);
}

async function logToFile(file, message, type) {
  // TODO: Clear/snip log after a certain period of time
  const log_date = new Date().toISOString();
  const log_file_path = path.join(__dirname, `../var/log/${file}`);
  const log_message = buildLogMessage(log_date, message, type);
  await fs.appendFile(log_file_path, log_message);
  return log_message;
}

async function fetchVaxRecords(numberOfDays, filesOnly = false, limit = 200) {
  if (!VAX_APP_TOKEN) {
    const error = await logToFile('fetch.log', 'Missing VAX_APP_TOKEN environment variable', 'ERROR');
    return Promise.reject(error);
  }

  // full query needs to be build each loop, with a new offset
  // const full_query = buildFullQuery(7, limit, 0);

let offset = 0, records = 0;

do {
  //  Loop through the call to fetch;
  //  query needs to be updated with
  //  a start value to paginate thru
  //  available data.
  //
  //  If we get exactly the number
  //  of records as the limit, that's a
  //  very likely sign that there are more
  //  refords to fetch.
  //
  //  Does this mean I should just hard-
  //  code a limit value? 5000? 10000?
  //  And how to update the buildFullQuery
  //  function to include the correct
  //  OFFSET value? And must OFFSET come
  //  before the LIMIT? Should I build
  //  a paginatedLimit() function to
  //  handle that?
  //

  let full_query = buildFullQuery(7, limit, offset);
  debug_message(console.log, full_query);

  try {
    const response = await fetch(
      full_query,
      fetch_options
    );
    if (!response.ok) {
      const data = await response.json();
      debug_message(console.log, data.message);
      const message = `An error occured fetching the resource: ${response.status}\n${data.message}`;
      for (let entry of response.headers.entries()) {
        console.log(entry[0]+ ': '+ entry[1]);
      }
      throw new Error(message);
    } else {
      try {
        const data = await response.json();
        logToFile('fetch.log', `Fetched ${data.length} records`, 'SUCCESS');
        for (let entry of response.headers.entries()) {
          console.log(entry[0]+ ': '+ entry[1]);
        }
        debug_message(console.log, `Fetched ${data.length} records`);
        records = data.length; // this is the number of records
        offset += data.length;
        debug_message(console.log, data[0]);

        // all.json, last.DAYS.days.json
        await fs.writeFile(path.join(__dirname, `../var/data/fetched.json`), JSON.stringify(data));
        if (!filesOnly) {
          // logic to write to database
        }
        // open the database connection

        // run updateMany with { upsert: true }

        // close the database connection

      } catch(error) {
        console.error(error.message);
      }
    }
  } catch(error) {
    // log to file?
    console.error(error.message);
    return;
  }
} while ( records === limit );

// end fetchVaxRecords function definition
}

module.exports = {
  fetchVaxRecords
};
if (process.env.NODE_ENV === 'test') {
  module.exports = {
    buildFullQuery,
    buildLogMessage,
    dateFromDaysAgo,
    fetchVaxRecords
  };
}
