const app = require('./routes/app.js');
const db = require('../db/index.js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Q&A is listening on ${port}`);
});
