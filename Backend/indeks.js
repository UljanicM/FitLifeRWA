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

// API endpoint for user registration
app.post("/api/registracija", (req, res) => {
    const { name, email, username, password } = req.body;
  
    // Validate the input data
    if (!name || !email || !username || !password) {
      return res.status(400).send("Svi podaci su obavezni.");
    }
  
    // Insert the user data into the database
    const query = 'INSERT INTO User (name, email, username, password) VALUES (?, ?, ?, ?)';
    connection.query(query, [name, email, username, password], (error, results) => {
      if (error) {
        console.error('Greška pri unosu korisnika:', error);
        return res.status(500).send('Greška pri unosu korisnika.');
      }
  
      res.status(200).send("Korisnik uspješno registriran.");
    });
  });

  // API rute za prijavu
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).send("Korisničko ime i lozinka su obavezni.");
    }
  
    // Provjera u bazi podataka
    const query = "SELECT * FROM User WHERE username = ?";
    connection.query(query, [username], (error, results) => {
      if (error) {
        return res.status(500).send("Greška pri provjeri korisničkih podataka.");
      }
  
      if (results.length === 0) {
        return res.status(404).send("Korisničko ime nije pronađeno.");
      }
  
      const user = results[0];
  
      // Provjera lozinke
      if (password === user.password) { // Trebali biste koristiti hashing za lozinke u stvarnom sustavu
        // Prijava je uspješna
        res.status(200).send({ message: "Prijava uspješna", user });
      } else {
        res.status(401).send("Pogrešna lozinka.");
      }
    });
  });