const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require('axios');
const mysql = require("mysql");
require('dotenv').config({ path: './info.env' });

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

// Ruta za dohvaćanje planova
app.get("/api/planovi", (request, response) => {
    connection.query("SELECT * FROM Plan", (error, results) => {
        if (error) throw error;
        response.send(results);
    });
});

// Ruta za dohvaćanje trenera
app.get("/api/treneri", (request, response) => {
    connection.query("SELECT Trener.ime_trenera AS ime, Trener.prezime_trenera AS prezime, Trener.specialnost, Trener.tel_broj_trenera AS 'telefon' FROM Trener", (error, results) => {
        if (error) throw error;
        response.send(results);
    });
});

// Ruta za dohvaćanje pojedinog trenera
app.get("/api/treneri/:id", (request, response) => {
    const id = request.params.id;
    connection.query("SELECT * FROM Trener WHERE id = ?", id, (error, results) => {
        if (error) throw error;
        response.send(results);
    });
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

  // API ruta za prijavu
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
      // Dodjela uloge admina za određena korisnička imena
      if (username === "esafarek" || username === "muljanic") {
        user.role = "admin"; // Dodajemo rolu "admin"
      }

      // Prijava je uspješna
      res.status(200).send({ message: "Prijava uspješna", user });
    } else {
      res.status(401).send("Pogrešna lozinka.");
    }
  });
});


// Nova ruta za ChatGPT API integraciju
// Nova ruta za ChatGPT API integraciju s umjetnim kašnjenjem
app.post("/api/chat", async (req, res) => {
  try {
      const { message } = req.body; // Korisnička poruka

      // Provjera da je poruka unesena
      if (!message) {
          return res.status(400).json({ error: 'Message is required' });
      }

      // Slanje zahtjeva prema ChatGPT API-ju
      const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
              model: 'gpt-3.5-turbo', // Ili 'gpt-4' ovisno o ključu
              messages: [{ role: 'user', content: message }],
              max_tokens: 500,
          },
          {
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              },
          }
      );

      // Umjetno kašnjenje od 3 sekunde
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Slanje odgovora klijentu
      res.json(response.data.choices[0].message);
  } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to connect to ChatGPT API' });
  }
});


app.post('/api/trainers', (req, res) => {
  const { ime_trenera, prezime_trenera, oib_trenera, adresa_trenera, tel_broj_trenera, specialnost } = req.body;

  // Logiranje podataka koji dolaze u zahtjevu
  console.log('Podaci iz zahtjeva:', req.body);

  // Provjera da li su svi podaci prisutni
  if (!ime_trenera || !prezime_trenera || !oib_trenera || !adresa_trenera || !tel_broj_trenera || !specialnost) {
    console.log('Greška: Nedostaju neki podaci');
    return res.status(400).json({ message: 'Svi podaci su obavezni.' });
  }

  // Upit za unos trenera u bazu
  const query = `INSERT INTO Trener (ime_trenera, prezime_trenera, oib_trenera, adresa_trenera, tel_broj_trenera, specialnost)
                 VALUES (?, ?, ?, ?, ?, ?)`;

  connection.query(query, [ime_trenera, prezime_trenera, oib_trenera, adresa_trenera, tel_broj_trenera, specialnost], (err, result) => {
    if (err) {
      // Logiranje greške ako dođe do problema u upitu
      console.error('Greška pri unosu trenera:', err);
      return res.status(500).json({ message: 'Došlo je do greške pri unosu trenera.', error: err });
    }
    res.status(200).json({ message: 'Trener uspješno unesen!', id: result.insertId });
  });
});

// Ruta za dohvaćanje svih vježbi
app.get("/api/vjezbe", (request, response) => {
  connection.query("SELECT * FROM Exercises", (error, results) => {
      if (error) throw error;
      response.send(results);
  });
});

// Ruta za dohvaćanje pojedine vježbe prema ID-u
app.get("/api/vjezbe/:id", (request, response) => {
  const id = request.params.id;
  connection.query("SELECT * FROM Exercises WHERE id = ?", [id], (error, results) => {
      if (error) throw error;
      response.send(results);
  });
});

// Ruta za dodavanje nove vježbe
app.post("/api/vjezbe", (req, res) => {
  const { name, category, difficulty } = req.body;

  // Provjera da su svi podaci prisutni
  if (!name || !category || !difficulty) {
    return res.status(400).json({ message: 'Svi podaci su obavezni.' });
  }

  // SQL upit za dodavanje vježbe u bazu podataka
  const query = `INSERT INTO Exercises (name, category, difficulty) 
                 VALUES (?, ?, ?)`;  // Bez label i value

  connection.query(query, [name, category, difficulty], (err, result) => {
      if (err) {
          console.error('Greška pri unosu vježbe:', err);
          return res.status(500).json({ message: 'Došlo je do greške pri unosu vježbe.', error: err });
      }
      // Ako je unos uspješan, vraćamo ID nove vježbe
      res.status(200).json({ message: 'Vježba uspješno unesena!', id: result.insertId });
  });
});




// Pokretanje servera
app.listen(port, () => {
    console.log("Server running at port: " + port);
});
