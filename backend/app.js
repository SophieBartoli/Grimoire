const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
const bodyParser = require('body-parser')
require('dotenv').config();

const Database = process.env.DATABASE;

mongoose.connect(Database,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(bodyParser.urlencoded({ extended: false }));           
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static('images'));


module.exports = app;