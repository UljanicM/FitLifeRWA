const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");
app.use(cors({"origin": "*"}));

const port = 3000;

// Parser za JSON podatke
app.use(bodyParser.json());

// Parser za podatke iz formi
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: 'ucka.veleri.hr',
    user: 'muljanic',
    password: '11',
    database: 'muljanic'
});

app.use(express.urlencoded({ extended: true }));

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

app.get("/api/planovi", (request, response) => {
    connection.query("SELECT * FROM Plan", (error, results) => {
        if (error) throw error;
        response.send(results);
    });
});

app.get("/api/treneri", (request, response) => {
    connection.query("SELECT Trener.ime_trenera AS ime, Trener.prezime_trenera AS prezime, Trener.specialnost, Trener.tel_broj_trenera AS 'telefon' FROM Trener", (error, results) => {
        if (error) throw error;
        response.send(results);
    });
});

app.get("/api/treneri/:id", (request, response) => {
    const id = request.params.id;
    connection.query("SELECT * FROM Trener WHERE id = ?", id, (error, results) => {
        if (error) throw error;
        response.send(results);
    });
});

app.listen(port, () => {
    console.log("Server running at port: " + port);
});