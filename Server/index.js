const app = require('./routes/app.js');
const db = require('../db/index.js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Q&A is listening on ${port}`);
  server.keepAliveTimeout = 75 * 1000;
  server.headersTimeout = 80 * 1000
});
