var models = require('../models/models.js');

module.exports = {
  getAnswers: function (count, offset, page, question_id, res) {
    models.getAnswersDb(count, offset, question_id, (err, data) => {
      if (err) {
        res.status(500).send(err);
      } else {
        var response = {
          question: question_id,
          page: page,
          count: count,
          results: data,
        }
        res.status(200).send(response)
      }
    });
  },
};
