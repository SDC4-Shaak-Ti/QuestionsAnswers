var db = require('../../db/index.js');




//get all Answers and related photos from the db
const getAnswersDb = function (count, offset, question_id, callback) {

  db.query(`SELECT json_build_object(
    'answer_id', answers.answer_id,
    'body', answers.body,
    'date', answers.date,
    'answerer_name', answers.answerer_name,
    'helpfulness', answers.helpfulness,
    'photos', (
      select json_agg(json_build_object(
        'id', photos.id,
        'url', photos.url
      ))
      from photos where photos.answer_id = answers.answer_id
    )
   ) from answers where answers.question_id=${question_id} AND answers.reported='false' ORDER BY answers.helpfulness DESC limit ${count} offset ${offset}
   `, (err, data) => {
    if (err) {
      callback(err);
    } else {
      var results = data.rows;
      var finalResults = [];
      results.forEach(result => {
        if (result.json_build_object.photos === null) {
          result.json_build_object.photos = [];
        }
        finalResults.push(result.json_build_object)
      })
      callback(null, finalResults);
    }

  });
}
//get all Questions and answers from the db
const getQuestionsDb = function (count, offset, product_id, callback) {

  db.query(`select json_build_object(
    'question_id', questions.question_id,
    'question_body', questions.question_body,
    'question_date', questions.question_date,
    'asker_name', questions.asker_name,
    'question_helpfulness', questions.question_helpfulness,
    'reported', questions.reported,
    'answers', (
       Select json_agg( json_build_object(
         'id', answers.answer_id,
         'body', answers.body,
         'date', answers.date,
         'answerer_name', answers.answerer_name,
         'helpfulness', answers.helpfulness,
         'photos', (
         select json_agg(json_build_object(
           'id', photos.id,
           'url', photos.url
         ))
             from photos where photos.answer_id = answers.answer_id
       )
       ))
         from answers where answers.question_id = questions.question_id
       )
  )
  from questions where questions.product_id=${product_id} AND questions.reported='false' ORDER BY questions.question_helpfulness DESC limit ${count} offset ${offset}
   `, (err, data) => {
    if (err) {
      console.log(err)
      callback(err);
    } else {
      var questions = data.rows;
      var finalResults = [];
      questions.forEach(question => {
        var answerObj = {};
        if (question.json_build_object.answers === null) {
          question.json_build_object.answers = {};
        } else {
          question?.json_build_object?.answers?.forEach(answer => {
            if (answer.photos === null) {
              answer.photos = [];
            }
            answerObj[answer.id] = answer
          })
          question.json_build_object.answers = answerObj
        }
        finalResults.push(question.json_build_object)
      })
      callback(null, finalResults)

    }
  })

}

//post a question to the database
const postQuestionsDb = function (email, body, name, date, product_id, callback) {
  var text = `INSERT INTO questions (product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness) VALUES ($1, $2, $3, $4, $5, $6, $7)`
  var values = [
    product_id,
    body,
    date,
    name,
    email,
    "false",
    0,
  ]
  db.query(text, values, (err, id) => {
    if (err) {
      callback(err)
    } else {
      callback(null, id)
    }
  })
}
//post an answer to the database
const postAnswersDb = function (email, body, name, date, photos, question_id, callback) {
  var text = `INSERT INTO answers (question_id, body, date, answerer_name, answerer_email, reported, helpfulness) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING answer_id`
  var values = [
    question_id,
    body,
    date,
    name,
    email,
    "false",
    0,
  ]
  db.query(text, values, (err, data) => {
    if (err) {
      callback(err)
    } else {
      answer_id = data.rows[0]['answer_id']
      async function insertPhotos(photos, answer_id) {
        for (var i = 0; i < photos.length; i++) {
          var text2 = `INSERT INTO photos (answer_id, url) VALUES ($1, $2)`
          values = [
            answer_id,
            photos[i],
          ]
          await db.query(text2, values)
        }
      }
      insertPhotos(photos, answer_id).then(() => {
        callback(null, data)
      })
        .catch((err) => {
          callback(err)
        })
    }
  })
}
const reportQuestionsDb = function (question_id, callback) {
  db.query(`update questions set reported='true' where question_id=${question_id}`)
    .then((res) => { callback(null, res) })
    .catch(err => { callback(err) })
}
const reportAnswersDb = function (answer_id, callback) {
  db.query(`update answers set reported='true' where answer_id=${answer_id}`)
    .then((res) => { callback(null, res) })
    .catch(err => { callback(err) })
}
const helpfulQuestionsDb = function (question_id, callback) {
  db.query(`update questions set question_helpfulness=question_helpfulness+1 where question_id=${question_id}`)
    .then((res) => { callback(null, res) })
    .catch(err => { callback(err) })
}
const helpfulAnswersDb = function (answer_id, callback) {
  db.query(`update answers set helpfulness=helpfulness+1 where answer_id=${answer_id}`)
    .then((res) => { callback(null, res) })
    .catch(err => { callback(err) })
}

module.exports = {
  helpfulAnswersDb: helpfulAnswersDb,
  helpfulQuestionsDb: helpfulQuestionsDb,
  reportAnswersDb: reportAnswersDb,
  reportQuestionsDb: reportQuestionsDb,
  postAnswersDb: postAnswersDb,
  postQuestionsDb: postQuestionsDb,
  getAnswersDb: getAnswersDb,
  getQuestionsDb: getQuestionsDb
}




