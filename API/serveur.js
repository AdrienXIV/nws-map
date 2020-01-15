const express = require('express');
const chalk = require('chalk');
const bodyParser = require('body-parser');
const cors = require('cors');

// COULEURS CONSOLE
const connected = chalk.bold.hex('#0652DD'); // connexion réussi, bleu
const success = chalk.green;
const error = chalk.bold.yellow; // erreur lors de la connexion
const disconnected = chalk.bold.red; // déconnexion
const termination = chalk.bold.magenta; // application quittée



const PORT = process.env.PORT || 8080;
const app = express();
// Midleware
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: true
}));
// lancement du serveur
app.listen(PORT, function (err) {
  if (err) console.error(error("erreur : " + err));
  else
    console.log(connected('Serveur lancé sur le port ' + PORT));
});

const DB_URI = 'mongodb://localhost/geojson'

const mongoose = require('mongoose');
const DB_OPTIONS = {
  socketTimeoutMS: 0,
  keepAlive: true,
  //reconnectTries: 30,
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// désactivation du buffercommand pour éviter que Mongoose lève une erreur quand un modèle est crée sans connexion
mongoose.set('bufferCommands', false);

// db connexion
mongoose.connect(DB_URI, DB_OPTIONS);

mongoose.connection.on('connected', function () {
  console.log(connected("La connexion par défaut Mongoose est ouverte à ", DB_URI));
});

mongoose.connection.on('error', function (err) {
  console.log(error("Erreur lors de la connexion par défaut Mongoose : " + err));
});

mongoose.connection.on('disconnected', function () {
  console.log(disconnected("La connexion par défaut Mongoose est déconnectée."));
});

process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log(termination("La connexion par défaut de Mongoose est déconnectée en raison de la fin de l'application."));
    process.exit(0);
  });
});

// #######################
// #######################

// MODELE
const featuresModel = require('./models/features');


// GET
app.get('/coordonnees', function (req, res) {
  featuresModel.find(function (err, doc) {
    if (err) console.error(error(err))
    else {
      let response = [];
      doc.forEach(element => {
        response.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: element.geometry.coordinates,
          },
          properties: element.properties
        });
      });

      res.status(200).json(response);
    }
  })
});

// POST
app.post('/coordonnees', function (req, res) {
  let features = [];
  req.body.forEach(element => {
    console.log(element)
    features.push(element)
  });
  featuresModel.insertMany(features).then(document => {
    res.status(201).json(document);
  }).catch(err => {
    console.error(error(err))
  });
});