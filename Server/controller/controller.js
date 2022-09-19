var models = require('../models/models.js');

module.exports = {
  getQuestions: function (count, offset, product_id, res) {
    models.getQuestionsDb(count, offset, product_id, (err, data) => {
      if (err) {
        res.status(500).send(err);
      } else {
        var response = {
          product_id: `${product_id}`,
          results: data,
        }
        res.status(200).send(response)
      }
    });
  },
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
  postQuestions: function (email, body, name, date, product_id, res){
    models.postQuestionsDb(email, body, name, date, product_id, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.sendStatus(201)
      }
    })
  },
  postAnswers: function (email, body, name, date, photos, question_id, res){
    models.postAnswersDb(email, body, name, date, photos, question_id, (err, data) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.sendStatus(201)
      }
    })
  },
  reportQuestions: function(question_id, res) {
    models.reportQuestionsDb(question_id, (err, data) => {
      if (err) {
        res.sendStatus(500).send(err)
      } else {
        res.sendStatus(204)
      }
    })
  },
  reportAnswers: function(answer_id, res) {
    models.reportAnswersDb(answer_id, (err, data) => {
      if (err) {
        res.sendStatus(500).send(err)
      } else {
        res.sendStatus(204)
      }
    })
  },
  helpfulAnswers: function(answer_id, res) {
    models.helpfulAnswersDb(answer_id, (err, data) => {
      if (err) {
        res.sendStatus(500).send(err)
      } else {
        res.sendStatus(204)
      }
    })
  },
  helpfulQuestions: function(question_id, res) {
    models.helpfulQuestionsDb(question_id, (err, data) => {
      if (err) {
        res.sendStatus(500).send(err)
      } else {
        res.sendStatus(204)
      }
    })
  },
};



