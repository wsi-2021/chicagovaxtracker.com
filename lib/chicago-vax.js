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

async function logToFile(file,message,type) {
  // TODO: Clear/snip log after a certain period of time
  const log_date = new Date().toISOString();
  const log_file_path = path.join(__dirname, `../var/log/${file}`);
  const log_message = buildLogMessage(log_date,message,type);
  await fs.appendFile(log_file_path, log_message + '\n');
  return log_message;
}

function buildLogMessage(date,message,type) {
  let full_message = `${date} - ${type}: ${message}`;
  if (!type) {
    full_message = `${date} - ${message}`;
  }
  return full_message;
}

async function fetchVaxRecords(numberOfDays, filesOnly) {
  if (!VAX_APP_TOKEN) {
    const error = await logToFile('fetch.log','Missing VAX_APP_TOKEN environment variable','ERROR');
    return Promise.reject(error);
  }
// end fetchVaxRecords function definition
}

module.exports = {
  fetchVaxRecords
}
