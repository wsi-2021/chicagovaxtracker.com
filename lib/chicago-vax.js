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

async function logToFile(file, message, type) {
  // TODO: Clear/snip log after a certain period of time
  const log_date = new Date().toISOString();
  const log_file_path = path.join(__dirname, `../var/log/${file}`);
  const log_message = buildLogMessage(log_date, message, type);
  await fs.appendFile(log_file_path, log_message);
  return log_message;
}
function dateFromDaysAgo(days_ago) {
  var start_date = new Date(new Date().setDate(new Date().getDate() - days_ago));
  return `${start_date.toISOString().split('T')[0]}T00:00:00.000`;
}
function buildLogMessage(date, message, type) {
  let full_message = `${date} - ${type}: ${message}\n`;
  if (!type) {
    full_message = `${date} - ${message}\n`;
  }
  return full_message;
}
function buildFullQuery(days, records) {
  const base_url = 'https://data.cityofchicago.org/resource/553k-3xzc.json';
  const select = `SELECT row_id AS _id, zip_code, date, total_doses_daily, total_doses_cumulative, _1st_dose_daily, _1st_dose_cumulative, _1st_dose_percent_population, vaccine_series_completed_daily, vaccine_series_completed_cumulative, vaccine_series_completed_percent_population, population`;
  const order_by = ` ORDER BY _id DESC`;
  const limit = ` LIMIT ${records}`;
  let where = ``;
  if (Number.isInteger(days)) {
    where = ` WHERE date > "${dateFromDaysAgo(days)}"`;
  }
  const full_query = `${select} ${where} ${order_by} ${limit}`;
  return `${base_url}?$query=${encodeURIComponent(full_query)}`;
}

function debug_message(func, message) {
  if (process.env.DEBUG) func.call(null, message);
}

async function fetchVaxRecords(numberOfDays, filesOnly = false) {
  if (!VAX_APP_TOKEN) {
    const error = await logToFile('fetch.log', 'Missing VAX_APP_TOKEN environment variable', 'ERROR');
    return Promise.reject(error);
  }

  const full_query = buildFullQuery(numberOfDays, 10000);

  // const query = `SELECT row_id AS _id, zip_code, date, total_doses_daily, total_doses_cumulative, _1st_dose_daily, _1st_dose_cumulative, _1st_dose_percent_population, vaccine_series_completed_daily, vaccine_series_completed_cumulative, vaccine_series_completed_percent_population, population WHERE date > "2021-04-12T00:00:00" ORDER BY _id DESC LIMIT 1000`;

  debug_message(console.log, full_query);

  // Working with dates:
  // https://dev.socrata.com/docs/datatypes/fixed_timestamp.html
  // var now = new Date();
  // var then = new Date(new Date().setDate(new Date().getDate() - 7));
  // between then and now in the query...
  // remember that times are Z, but can include a timezone offset in the query to ensure that
  // dates are correct for Chicago
  // then.getTimezoneOffset()/60 -> 5; need to convert to a string like -05:00
  // javascript returns a POSTIIVE number (which ought to be negative)
  try {
    const response = await fetch(
      full_query,
      fetch_options
    );
    if (!response.ok) {
      debug_message(console.log, response);
      const message = `An error occured fetching the resource: ${response.status}`;
      throw new Error(message);
    } else {
      try {
        const data = await response.json();
        logToFile('fetch.log', `Fetched ${data.length} records`, 'SUCCESS');
        debug_message(console.log, `Fetched ${data.length} records`);
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
  }
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
