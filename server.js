const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const exphbs  = require('express-handlebars');

const app = express();
const hbs = exphbs.create();




app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
//app.set("views", "views");

app.locals.layout = false;






app.use(express.static('public'));

const DATABASE_NAME = 'eng-dict2';
const MONGO_URL = `mongodb://localhost:27017`;

let db = null;
let collection = null;
let conn = null;

async function startServer() {
  // Set the db and collection variables before starting the server.
  conn = await MongoClient.connect(MONGO_URL);
  db = conn.db(DATABASE_NAME);
  collection = db.collection('words');
  // Now every route can safely use the db and collection objects.
  await app.listen(3000);
  console.log('Listening on port 3000');
}
startServer();

////////////////////////////////////////////////////////////////////////////////

// JSON-returning route

async function onLookupWord(req, res) {
  const routeParams = req.params;
  const word = routeParams.word;

  const query = { word: word.toLowerCase() };
  const result = await collection.findOne(query);

  const response = {
    word: word,
    definition: result ? result.definition : ''
  };
  res.json(response);
}
app.get('/lookup/:word', onLookupWord);

////////////////////////////////////////////////////////////////////////////////

// HTML-returning route

async function onViewWord(req, res) {
  const routeParams = req.params;
  const word = routeParams.word;

  const query = { word: word.toLowerCase() };
  const result = await collection.findOne(query);
  const definition = result ? result.definition : '';

  const placeholders = {
    word: word,
    definition: definition
  };
  res.render('word', placeholders);
}

app.get('/:word', onViewWord);

function onViewIndex(req, res) {
  res.render('index');
}
app.get('/', onViewIndex);
