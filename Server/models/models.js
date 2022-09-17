var db = require('../../db/index.js');

module.exports = {
  //get all Questions and answers from the db
  getQuestionsDb: function (count, offset, product_id, callback) {
    db.query(`SELECT question_id, question_body, question_date, asker_name, question_helpfulness, reported FROM answers RIGHT JOIN answers using question_id WHERE product_id=${product_id} AND reported='false' ORDER BY helpful DESC limit ${count} offset ${offset}`, (err, data) => {
      if (err) {
        callback(err);
      } else {
        console.log(data)
        // callback(null, data.rows);


      }

    });
  },
  //get all Answers and related photos from the db
  getAnswersDb: function (count, offset, question_id, callback) {
    console.log('count ', count, 'offset ', offset, 'question_id ', question_id)
    // `SELECT answer_id, body, date, answerer_name, helpfulness FROM answers WHERE question_id=${question_id} AND reported='false' ORDER BY helpfulness DESC limit ${count} offset ${offset}`
    db.query(`SELECT answers.answer_id, body, date, answerer_name, helpfulness, photos.id, photos.url FROM answers FULL OUTER JOIN photos on answers.answer_id=photos.answer_id WHERE answers.question_id=${question_id} AND answers.reported='false' ORDER BY answers.helpfulness DESC limit ${count} offset ${offset}`, (err, data) => {
      if (err) {
        callback(err);
      } else {
        var initialResults = data.rows;
        var photoObj = {};
        finalResults = []
        initialResults.forEach(result => {
          if (result.id === null) {
            delete result.id;
            delete result.url;
            result.photos=[];
            finalResults.push(result)
          } else {
            if (photoObj[result.id] === undefined) {
              console.log('adding ot photoObj ', result.id)
              photoObj[result.id]=result.url
              result.photos=[{id: result.id, url: result.url}]
              delete result.id;
              delete result.url;
              finalResults.push(result)
            } else {
              console.log('addin')
              finalResults.forEach(finalResult => {
                if (finalResult['answer_id'] === result.answer_id) {
                  finalResult['photos'].push({id: result.id, url: result.url})
                }
              })
            }
          }
        })
        console.log(finalResults)
        callback(null, finalResults);


      }

    });
  },
  //post a question to the database
  postQuestionsDb: function (email, body, name, date, product_id, callback) {
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
    console.log(values)
    //TODO: Check if id is actually the output
    db.query(text, values, (err, id) => {
      if (err) {
        callback(err)
      } else {

        callback(null, id)
      }
    })
  },
  //post an answer to the database
  postAnswersDb: function (email, body, name, date, photos, question_id, callback) {
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
    console.log(values)
    //TODO: Check if id is actually the output
    db.query(text, values, (err, data) => {
      if (err) {
        callback(err)
      } else {
        answer_id = data.rows[0]['answer_id']
        console.log(answer_id)
        console.log(photos)
        async function insertPhotos(photos, answer_id) {
          for (var i = 0; i < photos.length; i++) {
           var text2 = `INSERT INTO photos (answer_id, url) VALUES ($1, $2)`
           values = [
              answer_id,
              photos[i],
           ]
            await db.query(text2, values).then(()=>{console.log('success')})
          }
        }
        insertPhotos(photos, answer_id)
        callback(null, 201)
      }
    })
  },
  reportQuestionsDb: function(question_id, callback) {
    db.query(`update questions set reported='true' where question_id=${question_id}`)
    .then(()=>{callback(null, 'success')})
    .catch(err=> {callback(err)})
  },
  reportAnswersDb: function(answer_id, callback) {
    db.query(`update answers set reported='true' where answer_id=${answer_id}`)
    .then(()=>{callback(null, 'success')})
    .catch(err=> {callback(err)})
  },
  helpfulQuestionsDb: function(question_id, callback) {
    db.query(`update questions set question_helpfulness=question_helpfulness+1 where question_id=${question_id}`)
    .then(()=>{callback(null, 'success')})
    .catch(err=> {callback(err)})
  },
  helpfulAnswersDb: function(answer_id, callback) {
    db.query(`update answers set helpfulness=helpfulness+1 where answer_id=${answer_id}`)
    .then(()=>{callback(null, 'success')})
    .catch(err=> {callback(err)})
  },
};



// SELECT answers.answer_id, body, date, answerer_name, helpfulness, photos.id, photos.url FROM answers FULL OUTER JOIN photos on answers.answer_id=photos.answer_id WHERE answers.question_id=642000 AND answers.reported='false' ORDER BY answers.helpfulness DESC limit 5 offset 0;