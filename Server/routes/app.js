const express = require('express');
const partials = require('express-partials');
const controller = require('../controller/controller.js');


const app = express();


app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(`/loaderio-5734af89c1b548e329bf68fc3dc3ae70`, (req, res) => {
  res.sendFile('../../loaderio-5734af89c1b548e329bf68fc3dc3ae70.txt')
})


app.get(`/qa/questions/*/answers`,
  (req, res) => {
    // console.log(req.query)
    var page = parseInt(req.query.page) || 1;
    var count = parseInt(req.query.count) || 5;
    var offset = (page - 1) * count
    var urlArray = req.url.split('/')
    var question_id = parseInt(urlArray[3])
    controller.getAnswers(count, offset, page, question_id, res)
  });

app.post(`/qa/questions/*/answers`,
  (req, res) => {
    var date = new Date().toISOString();
    var email = req.body.email;
    var body = req.body.body;
    var name = req.body.name;
    var photos = req.body.photos;

    var urlArray = req.url.split('/')
    var question_id = parseInt(urlArray[3])

    controller.postAnswers(email, body, name, date, photos, question_id, res)
  });

app.post('/qa/questions', (req, res) => {
  var date = new Date().toISOString();
  var email = req.body.email;
  var body = req.body.body;
  var name = req.body.name;
  var product_id = parseInt(req.body.product_id)

  controller.postQuestions(email, body, name, date, product_id, res)

});


app.put(`/qa/questions/*/helpful`,
  (req, res) => {
    var urlArray = req.url.split('/')
    var question_id = parseInt(urlArray[3])
    controller.helpfulQuestions(question_id, res);
  });

app.put(`/qa/questions/*/report`,
  (req, res) => {
    var urlArray = req.url.split('/')
    var question_id = parseInt(urlArray[3])
    controller.reportQuestions(question_id, res);

  });


app.put(`/qa/answers/*/helpful`,
  (req, res) => {
    var urlArray = req.url.split('/')
    var answer_id = parseInt(urlArray[3])
    controller.helpfulAnswers(answer_id, res);
  });

app.put(`/qa/answers/*/report`,
  (req, res) => {
    var urlArray = req.url.split('/')
    var answer_id = parseInt(urlArray[3])
    controller.reportAnswers(answer_id, res);
  });

app.get('/qa/questions',
  (req, res) => {
    var page = parseInt(req.query.page) || 1;
    var count = parseInt(req.query.count) || 5;
    var product_id = parseInt(req.query.product_id)
    var offset = (page - 1) * count
    controller.getQuestions(count, offset, product_id, res)
  });
module.exports = app;
