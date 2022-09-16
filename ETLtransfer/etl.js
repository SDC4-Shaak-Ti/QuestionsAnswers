const fs = require("fs");
const fastcsv = require("fast-csv");
const { Client } = require("pg");
const assert = require('assert');
const { generate } = require('csv-generate');
const { parse } = require('csv-parse');
const path = require('path')
require('dotenv').config();


async function populateTableAnswers() {

  const client = new Client({
    // host: process.env.DBHOST,
    // database: process.env.DBDATABASE,
    // password: process.env.DBPASSWORD,
    // port: process.env.DBPORT
    host: 'localhost',
    database: 'sdc',
    password: '',
    port: 5432
  });
  await client.connect();
  await (async () => {
    const parser = fs.createReadStream("./answers.csv").pipe(parse({
      skip_records_with_error: true,
      columns: true,
      // to_line: 5
    }));


    const text =
      "INSERT INTO answers (answer_id, question_id, body, date_written, answerer_name, answerer_email, reported, helpful) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";

    process.stdout.write('...starting answers')
    for await (const record of parser) {
      var date = new Date(parseInt(record.date_written))
      var report;
      record.reported === '0' ? report="false" : report="true"
      var values = [
        parseInt(record.id),
        parseInt(record.question_id),
        record.body,
        date,
        record.answerer_name,
        record.answerer_email,
        report,
        parseInt(record.helpful),
      ]

      await client.query(text, values)
    };

    process.stdout.write('...done answers')

  })()
}


populateTableAnswers()


async function populateTableQuestions() {

  const client = new Client({
    // host: process.env.DBHOST,
    // database: process.env.DBDATABASE,
    // password: process.env.DBPASSWORD,
    // port: process.env.DBPORT
    host: 'localhost',
    database: 'sdc',
    password: '',
    port: 5432
  });
  await client.connect();
  await (async () => {
    const parser = fs.createReadStream(path.join(__dirname + "/questions.csv")).pipe(parse({
      skip_records_with_error: true,
      columns: true,
      // to_line: 5
    }));


    const text =
      "INSERT INTO questions (question_id, product_id, body, date_written, asker_name, asker_email, reported, helpful) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";

    process.stdout.write('...starting questions')
    for await (const record of parser) {
      var date = new Date(parseInt(record.date_written))
      var report;
     record.reported === '0' ? report="false" : report="true"
      var values = [
        parseInt(record.id),
        parseInt(record.product_id),
        record.body,
        date,
        record.asker_name,
        record.asker_email,
        report,
        parseInt(record.helpful),
      ]

      await client.query(text, values)
    };

    process.stdout.write('...done questions')

  })()
}

populateTableQuestions()


async function populateTablePhotos() {

  const client = new Client({
    // host: process.env.DBHOST,
    // database: process.env.DBDATABASE,
    // password: process.env.DBPASSWORD,
    // port: process.env.DBPORT
    host: 'localhost',
    database: 'sdc',
    password: '',
    port: 5432
  });
  await client.connect();
  await (async () => {
    const parser = fs.createReadStream(path.join(__dirname + "/answers_photos.csv")).pipe(parse({
      skip_records_with_error: true,
      columns: true,
      // to_line: 5
    }));


    const text =
      "INSERT INTO photos (id, answer_id, url) VALUES ($1, $2, $3)";

    process.stdout.write('...starting photos')
    for await (const record of parser) {
      var date = new Date(parseInt(record.date_written))
      // console.log(date)
      var values = [
        parseInt(record.id),
        parseInt(record.answer_id),
        record.url,
      ]

      await client.query(text, values)
    };

    process.stdout.write('...done photos')

  })()
}

// populateTablePhotos();