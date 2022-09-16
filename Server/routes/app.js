const express = require('express');
const partials = require('express-partials');
const controller = require('../controller/controller.js');


const app = express();


app.use(partials());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/qa/questions',
  (req, res) => {
    var product_id = req.query.product_id
    // console.log(req.query)
    res.sendStatus(200)
  });

app.post('/qa/questions', (req, res) => {

});

app.get(`/qa/questions/*/answers`,
  (req, res) => {
    var page = parseInt(req.query.page)
    var count = parseInt(req.query.count)
    var offset = (page - 1) * count
    var urlArray = req.url.split('/')
    var question_id = parseInt(urlArray[3])
    console.log('count ', count, 'offset ', offset, 'question_id ', question_id)

    controller.getAnswers(count, offset, page, question_id, res)
  });

app.post(`/qa/questions/*/answers`,
  (req, res) => {

  });

app.put(`/qa/questions/*/helpful`,
  (req, res) => {
    res.sendStatus(204)

  });
app.put(`/qa/questions/*/report`,
  (req, res) => {
    res.sendStatus(204)

  });


app.put(`/qa/answers/*/helpful`,
  (req, res) => {
    res.sendStatus(204)
  });
app.put(`/qa/answers/*/report`,
  (req, res) => {
    res.sendStatus(204)

  });
module.exports = app;
