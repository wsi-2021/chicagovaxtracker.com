const mongo = require('mongodb').MongoClient;

async function connect(url = process.env.MONGO_URL) {
  try {
    let client = await mongo.connect(url, { useUnifiedTopology: true});
    return client;
  } catch(e) {
    console.error(e.message);
  }
}

module.exports = {
  connect
}
