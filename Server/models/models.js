var db = require('../../db/index.js');



const processAnswerArray = function (initialResults) {
  var photoObj = {};
  var finalResults = [];
  initialResults.forEach(result => {
    if (result.answer_id !== null) {
      if (result.id === null) {
        delete result.id;
        delete result.url;
        result.photos = [];
        finalResults.push(result)
      } else {
        if (photoObj[result.answer_id] === undefined) {
          photoObj[result.answer_id] = result.url
          result.photos = [{ id: result.id, url: result.url }]
          delete result.id;
          delete result.url;
          finalResults.push(result)
        } else {
          finalResults.forEach(finalResult => {
            if (finalResult['answer_id'] === result.answer_id) {
              finalResult['photos'].push({ id: result.id, url: result.url })
            }
          })
        }
      }
    }
  })
  return finalResults
}
//get all Answers and related photos from the db
const getAnswersDb = function (count, offset, question_id, callback) {
  // var text =`SELECT answers.answer_id, body, date, answerer_name, helpfulness, photos.id, photos.url FROM answers FULL OUTER JOIN photos on answers.answer_id=photos.answer_id WHERE answers.question_id=${question_id} AND answers.reported='false' ORDER BY answers.helpfulness DESC limit ${count} offset ${offset}`
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
  db.query(`SELECT questions.question_id, question_body, question_date, asker_name, question_helpfulness, questions.reported, answers.answer_id, body, date, answerer_name, helpfulness, id, url FROM questions FULL OUTER JOIN answers ON questions.question_id=answers.question_id FULL OUTER JOIN photos ON answers.answer_id=photos.answer_id WHERE questions.product_id=${product_id} AND questions.reported='false' ORDER BY question_helpfulness, helpfulness DESC limit ${count} offset ${offset}`, (err, data) => {
    if (err) {
      callback(err);
    } else {
      var questions = data.rows;
      var finalResults = []
      var answersResults = []
      var questionAnswerKeys = {};
      questions.forEach(question => {
        if (questionAnswerKeys[question.question_id] === undefined) {
          questionAnswerKeys[question.question_id] = [question.answer_id]
          answersResults.push({
            answer_id: question.answer_id,
            body: question.body,
            date: question.date,
            answerer_name: question.answerer_name,
            helpfulness: question.helpfulness,
            id: question.id,
            url: question.url
          })
          delete question.answer_id,
            delete question.body,
            delete question.date,
            delete question.answerer_name,
            delete question.helpfulness,
            delete question.id,
            delete question.url
          finalResults.push(question)
        } else {
          questionAnswerKeys[question.question_id].push(question.answer_id)
          answersResults.push({
            answer_id: question.answer_id,
            body: question.body,
            date: question.date,
            answerer_name: question.answerer_name,
            helpfulness: question.helpfulness,
            id: question.id,
            url: question.url
          })
        }
      })
      var processedAnswersResults = processAnswerArray(answersResults)
      var answerObj = {}
      processedAnswersResults.forEach(answer => {
        answer.id = answer.answer_id;
        delete answer.answer_id;
        answerObj[answer.id] = answer
      })
      finalResults.forEach(question => {
        var answerIds = questionAnswerKeys[question.question_id]
        question.answers = {};
        answerIds.forEach(id => {
          if (id !== null) {
            question.answers[id] = answerObj[`${id}`]
          }
        })
      })
      finalResults.sort((a, b) => {
        return b.question_helpfulness - a.question_helpfulness;
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
      insertPhotos(photos, answer_id).then(()=>{
        callback(null, data)
      })
      .catch((err)=>{
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











