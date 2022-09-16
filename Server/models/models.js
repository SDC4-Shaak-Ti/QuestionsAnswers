var db = require('../../db/index.js');

module.exports = {
  getAnswersDb: function (count, offset, question_id, callback) {
    console.log('count ', count, 'offset ', offset, 'question_id ', question_id )
    db.query(`SELECT answer_id, body, date_written, answerer_name, helpful FROM answers WHERE question_id=${question_id} AND reported="false" ORDER BY helpful DESC limit ${count} offset ${offset}`, (err, data) => {
      if (err) {
        callback(err);
      } else {
        data.rows.forEach(answer => {
          db.query('SELECT id, url FROM photos WHERE ')
          callback(null, data.rows);

        })
      }

    });
  }, // a function which produces all the messages

};