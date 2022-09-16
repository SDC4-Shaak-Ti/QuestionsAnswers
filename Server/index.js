const app = require('./routes/app.js');
const db = require('../db/index.js');
require('dotenv').config();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Q&A is listening on ${port}`);
});
