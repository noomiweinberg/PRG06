// package koppelen voor de web server
const express = require('express');

// maak beschikbaar via app
const app = express()

const mongoose = require('mongoose');

mongoose.connect ('mongodb://localhost/tracks');


console.log("Starting: REST API")

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extendedparser : true}));

// voeg entry toe voor url /
app.get('/', function(req, res) {
    console.log("End point /")
    res.header("Content-Type", "application/json")
    res.send("{ \"message\": \"Hello World!\"}")

})

const tracksRouter = require('./routes/tracksRoutes')();

app.use('/api', tracksRouter); 


// start web applicatie
// standaard poort 80, advies 8000 voor hogeschool VPS
app.listen(8000)