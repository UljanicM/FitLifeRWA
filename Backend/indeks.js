const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require('axios');
const mysql = require("mysql2/promise");
require('dotenv').config({ path: './info.env' }); // Osigurajte da je ovo na vrhu
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Uvezi jsonwebtoken

// Dohvati JWT tajni ključ iz .env datoteke
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('Greška: JWT_SECRET nije definiran u info.env datoteci!');
    process.exit(1); // Prekini aplikaciju ako tajni ključ nedostaje
}

app.use(cors({"origin": "*"}));

const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let pool; // Definiramo pool varijablu

async function connectToDatabase() {
    try {
        pool = await mysql.createPool({
            host: 'ucka.veleri.hr',
            user: 'muljanic',
            password: '11',
            database: 'muljanic',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log("Povezano s MySQL-om!");
    } catch (err) {
        console.error('Greška pri povezivanju s MySQL bazom podataka:', err);
        process.exit(1);
    }
}

connectToDatabase();

app.use(express.urlencoded({ extended: true }));

// Middleware za provjeru JWT-a i autentifikaciju
function authenticateToken(req, res, next) {
    console.log('Backend: authenticateToken middleware reached.'); // DEBUG LOG
    const authHeader = req.headers['authorization'];
    console.log('Backend: Authorization Header:', authHeader); // DEBUG LOG

    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN
    console.log('Backend: Extracted Token:', token); // DEBUG LOG

    if (token == null) {
        console.log('Backend: Token is null, sending 401.'); // DEBUG LOG
        return res.status(401).json({ message: 'Autorizacijski token nije pronađen.' }); // Neovlašteno
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Backend: Greška pri verifikaciji tokena:', err.message); // DEBUG LOG
            return res.status(403).json({ message: 'Token je nevažeći ili istekao.' }); // Zabranjeno
        }
        req.user = user; // Dodaj dekodirane informacije o korisniku (oib, email, role) u request objekt
        console.log('Backend: Token verified. User:', user); // DEBUG LOG
        next(); // Nastavi na sljedeći middleware ili rutu
    });
}

// Middleware za provjeru uloge
function authorizeRole(roles) {
    return (req, res, next) => {
        console.log('Backend: authorizeRole middleware reached. User role:', req.user?.role, 'Required roles:', roles); // DEBUG LOG
        if (!req.user || !req.user.role) {
            console.log('Backend: No user role info, sending 403.'); // DEBUG LOG
            return res.status(403).json({ message: 'Nema informacija o ulozi korisnika u tokenu.' });
        }
        if (!roles.includes(req.user.role)) {
            console.log('Backend: User role not authorized, sending 403.'); // DEBUG LOG
            return res.status(403).json({ message: `Nemate potrebnu ulogu (${roles.join(', ')}) za pristup ovoj ruti.` });
        }
        console.log('Backend: User authorized for role.'); // DEBUG LOG
        next();
    };
}


// --- API RUTE ---

// Ruta za dohvaćanje planova (ZAŠTIĆENA)
app.get("/api/planovi", authenticateToken, async (request, response) => {
    console.log('Backend: /api/planovi route reached.'); // DEBUG LOG
    try {
        const [results] = await pool.query("SELECT * FROM Plan");
        response.send(results);
    } catch (error) {
        console.error('Backend: Greška pri dohvaćanju planova:', error);
        return response.status(500).send('Greška pri dohvaćanju planova.');
    }
});

// Ruta za dodavanje novih planova (ZAŠTIĆENA, SAMO ZA ADMINA ILI TRENERA)
app.post("/api/planovi", authenticateToken, authorizeRole(['admin', 'trainer']), async (req, res) => {
    console.log('Backend: POST /api/planovi route reached.'); // DEBUG LOG
    const { naziv_plana, cijena_plana, trajanje_plana, prehrana, kategorija_plana } = req.body;

    if (!naziv_plana || cijena_plana === undefined || trajanje_plana === undefined || !prehrana || !kategorija_plana) {
        return res.status(400).json({ message: 'Svi podaci za plan su obavezni.' });
    }

    try {
        const query = `INSERT INTO Plan (naziv_plana, cijena_plana, trajanje_plana, prehrana, kategorija_plana)
                       VALUES (?, ?, ?, ?, ?)`;
        const [result] = await pool.query(query, [naziv_plana, cijena_plana, trajanje_plana, prehrana, kategorija_plana]);
        res.status(201).json({ message: 'Plan uspješno dodan!', id: result.insertId });
    } catch (err) {
        console.error('Backend: Greška pri dodavanju plana:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Plan s tim nazivom već postoji.' });
        }
        res.status(500).json({ message: 'Došlo je do greške pri dodavanju plana.', error: err.message });
    }
});


// Ruta za dohvaćanje trenera (ZAŠTIĆENA)
app.get("/api/treneri", authenticateToken, async (request, response) => {
    console.log('Backend: /api/treneri route reached.'); // DEBUG LOG
    try {
        const [results] = await pool.query("SELECT Trener.ime_trenera AS ime, Trener.prezime_trenera AS prezime, Trener.strucnost, Trener.tel_broj_trenera AS telefon, Trener.email_trenera AS email, Trener.oib_trenera FROM Trener");
        response.send(results);
    } catch (error) {
        console.error('Backend: Greška pri dohvaćanju trenera:', error);
        return response.status(500).send('Greška pri dohvaćanju trenera.');
    }
});

// Ruta za dohvaćanje pojedinog trenera po OIB-u (ZAŠTIĆENA)
app.get("/api/treneri/:oib_trenera", authenticateToken, async (request, response) => {
    console.log('Backend: /api/treneri/:oib_trenera route reached.'); // DEBUG LOG
    const oib_trenera = request.params.oib_trenera;
    // Trenutno, svi prijavljeni korisnici mogu vidjeti detalje trenera
    // Ako želite ograničiti, vratite provjeru uloge/OIB-a
    try {
        const [results] = await pool.query("SELECT * FROM Trener WHERE oib_trenera = ?", [oib_trenera]);
        if (results.length === 0) {
            return response.status(404).send("Trener nije pronađen.");
        }
        response.send(results[0]);
    } catch (error) {
        console.error('Backend: Greška pri dohvaćanju trenera:', error);
        return response.status(500).send('Greška pri dohvaćanju trenera.');
    }
});

// API endpoint za registraciju člana (JAVNA)
app.post("/api/registracija", async (req, res) => {
    console.log('Backend: /api/registracija route reached.'); // DEBUG LOG
    const { oib, email, name, password, prezime } = req.body;

    const oib_clana = oib;
    const email_clana = email;
    const ime_clana = name;
    const prezime_clana = prezime;

    if (!oib_clana || !email_clana || !ime_clana || !prezime_clana || !password) {
      return res.status(400).send("OIB, email, ime, prezime i lozinka su obavezni.");
    }

    try {
      const saltRounds = 10;
      const hashiranaLozinka = await bcrypt.hash(password, saltRounds);

      const query = 'INSERT INTO Clan (oib_clana, email_clana, ime_clana, prezime_clana, lozinka_clana) VALUES (?, ?, ?, ?, ?)';

      await pool.query(query, [oib_clana, email_clana, ime_clana, prezime_clana, hashiranaLozinka]);
      res.status(200).send("Član uspješno registriran.");
    } catch (error) {
      console.error('Backend: Greška pri unosu člana/hashiranju lozinke:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).send('Član s tim OIB-om već postoji.');
      }
      res.status(500).send('Došlo je do greške prilikom obrade vaše registracije.');
    }
});

// API ruta za prijavu člana (JAVNA - sada izdaje JWT)
app.post("/api/login", async (req, res) => {
    console.log('Backend: /api/login route reached.'); // DEBUG LOG
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email i lozinka su obavezni.");
    }

    const email_clana = email;

    try {
        const query = "SELECT * FROM Clan WHERE email_clana = ?";
        const [results] = await pool.query(query, [email_clana]);

        if (results.length === 0) {
            return res.status(401).send("Pogrešan email ili lozinka.");
        }

        const clan = results[0];

        const match = await bcrypt.compare(password, clan.lozinka_clana);

        if (match) {
            const clanDataToSend = { ...clan };
            delete clanDataToSend.lozinka_clana;

            // Odredi ulogu
            let role = "member";
            if (clan.email_clana === "safarekerik@gmail.com" || clan.oib_clana === "muljanic") {
                role = "admin";
            }
            clanDataToSend.role = role;

            // Generiraj JWT
            const token = jwt.sign(
                { oib: clan.oib_clana, email: clan.email_clana, role: role },
                JWT_SECRET,
                { expiresIn: '1h' } // Token ističe za 1 sat
            );
            console.log('Backend: Member login successful, JWT generated.'); // DEBUG LOG
            res.status(200).send({ message: "Prijava uspješna", clan: clanDataToSend, token: token });
        } else {
            res.status(401).send("Pogrešan email ili lozinka.");
        }
    } catch (error) {
        console.error('Backend: Greška pri provjeri/usporedbi lozinki:', error);
        res.status(500).send('Došlo je do greške prilikom prijave.');
    }
});

// API ruta za prijavu trenera (JAVNA - sada izdaje JWT)
app.post("/api/trainer/login", async (req, res) => {
    console.log('Backend: /api/trainer/login route reached.'); // DEBUG LOG
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email i lozinka su obavezni.");
    }

    const email_trenera = email;

    try {
        const query = "SELECT * FROM Trener WHERE email_trenera = ?";
        const [results] = await pool.query(query, [email_trenera]);

        if (results.length === 0) {
            return res.status(401).send("Pogrešan email ili lozinka za trenera.");
        }

        const trainer = results[0];

        const match = await bcrypt.compare(password, trainer.lozinka_trenera);

        if (match) {
            const trainerDataToSend = { ...trainer };
            delete trainerDataToSend.lozinka_trenera;
            trainerDataToSend.role = "trainer"; // Uloga za trenera

            // Generiraj JWT
            const token = jwt.sign(
                { oib: trainer.oib_trenera, email: trainer.email_trenera, role: "trainer" },
                JWT_SECRET,
                { expiresIn: '1h' } // Token ističe za 1 sat
            );
            console.log('Backend: Trainer login successful, JWT generated.'); // DEBUG LOG
            res.status(200).send({ message: "Prijava trenera uspješna", trainer: trainerDataToSend, token: token });
        } else {
            res.status(401).send("Pogrešan email ili lozinka za trenera.");
        }
    } catch (error) {
        console.error('Backend: Greška pri provjeri/usporedbi lozinki trenera:', error);
        res.status(500).send('Došlo je do greške prilikom prijave trenera.');
    }
});


// API ruta za dohvaćanje podataka profila pojedinog člana (ZAŠTIĆENA)
app.get("/api/clan/:oib_clana", authenticateToken, async (req, res) => {
    console.log('Backend: GET /api/clan/:oib_clana route reached.'); // DEBUG LOG
    const oib_clana = req.params.oib_clana;
    // PROMJENA: Uklonjena stroga provjera uloge/OIB-a
    // Sada svi prijavljeni korisnici (član, trener, admin) mogu vidjeti detalje člana.
    try {
        const [results] = await pool.query(
            "SELECT oib_clana, email_clana, ime_clana, prezime_clana, tel_broj_clana, kilaza, kategorija FROM Clan WHERE oib_clana = ?",
            [oib_clana]
        );
        if (results.length === 0) {
            return res.status(404).send("Član nije pronađen.");
        }
        res.status(200).send({ clan: results[0] });
    } catch (error) {
        console.error('Backend: Greška pri dohvaćanju člana:', error);
        return res.status(500).send('Greška pri dohvaćanju podataka o članu.');
    }
});

// API ruta za ažuriranje podataka profila člana (ZAŠTIĆENA)
app.put("/api/clan/:oib_clana", authenticateToken, async (req, res) => {
    console.log('Backend: PUT /api/clan/:oib_clana route reached.'); // DEBUG LOG
    const oib_clana = req.params.oib_clana;
    const { ime_clana, prezime_clana, email_clana, tel_broj_clana, kilaza, kategorija } = req.body;

    // Dodatna provjera: Samo korisnik s vlastitim OIB-om ili admin može ažurirati profil
    if (req.user.role !== 'admin' && req.user.oib !== oib_clana) {
        console.log('Backend: Unauthorized access attempt to update clan profile by role/OIB mismatch.'); // DEBUG LOG
        return res.status(403).json({ message: 'Nemate dozvolu za ažuriranje ovog profila.' });
    }

    if (!ime_clana || !prezime_clana || !email_clana) {
        return res.status(400).send("Ime, prezime i email su obavezni za ažuriranje.");
    }

    const query = `UPDATE Clan SET ime_clana = ?, prezime_clana = ?, email_clana = ?, tel_broj_clana = ?, kilaza = ?, kategorija = ? WHERE oib_clana = ?`;

    try {
        const [updateResults] = await pool.query(
            query,
            [ime_clana, prezime_clana, email_clana, tel_broj_clana, kilaza, kategorija, oib_clana]
        );

        if (updateResults.affectedRows === 0) {
            return res.status(404).send("Član nije pronađen ili podaci nisu promijenjeni.");
        }

        const [updatedResults] = await pool.query(
            "SELECT oib_clana, email_clana, ime_clana, prezime_clana, tel_broj_clana, kilaza, kategorija FROM Clan WHERE oib_clana = ?",
            [oib_clana]
        );
        res.status(200).send({ message: 'Profil uspješno ažuriran.', clan: updatedResults[0] });
    } catch (error) {
        console.error('Backend: Greška pri ažuriranju člana:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('Email adresa je već u upotrebi.');
        }
        res.status(500).send('Greška pri ažuriranju podataka o članu.');
    }
});

// API ruta za dohvaćanje svih članova (za pretraživanje) (ZAŠTIĆENA)
app.get("/api/clanovi", authenticateToken, async (request, response) => {
    console.log('Backend: /api/clanovi route reached.'); // DEBUG LOG
    try {
        const [results] = await pool.query(
            "SELECT oib_clana, ime_clana, prezime_clana, email_clana, tel_broj_clana, kilaza, kategorija FROM Clan"
        );
        response.status(200).send({ clanovi: results });
    } catch (error) {
        console.error('Backend: Greška pri dohvaćanju članova:', error);
        return response.status(500).send('Greška pri dohvaćanju članova.');
    }
});

// API za odabir plana i trenera za člana (ZAŠTIĆENA)
app.post("/api/clanovi/odabir-plana", authenticateToken, async (req, res) => {
    console.log('Backend: POST /api/clanovi/odabir-plana route reached.'); // DEBUG LOG
    const { oib_clana, naziv_plana, oib_trenera } = req.body;

    // Dodatna provjera: Samo korisnik s vlastitim OIB-om ili admin može odabrati plan
    if (req.user.role !== 'admin' && req.user.oib !== oib_clana) {
        console.log('Backend: Unauthorized access attempt to select plan by role/OIB mismatch.'); // DEBUG LOG
        return res.status(403).json({ message: 'Nemate dozvolu za odabir plana za ovog člana.' });
    }

    if (!oib_clana || !naziv_plana || !oib_trenera) {
        return res.status(400).json({ message: 'OIB člana, naziv plana i OIB trenera su obavezni.' });
    }

    try {
        const [planResults] = await pool.query("SELECT trajanje_plana FROM Plan WHERE naziv_plana = ?", [naziv_plana]);
        if (planResults.length === 0) {
            return res.status(404).json({ message: 'Plan s tim nazivom nije pronađen.' });
        }
        const trajanje_plana = planResults[0].trajanje_plana;

        const datum_pocetka_plana = new Date();
        const datum_isteka_plana = new Date(datum_pocetka_plana);
        datum_isteka_plana.setDate(datum_pocetka_plana.getDate() + trajanje_plana);

        const formatted_pocetak = datum_pocetka_plana.toISOString().slice(0, 10);
        const formatted_istek = datum_isteka_plana.toISOString().slice(0, 10);

        const [existingClanNaPlanuEntry] = await pool.query("SELECT * FROM Clan_Na_Planu WHERE oib_clana = ?", [oib_clana]);

        let query;
        let params;

        if (existingClanNaPlanuEntry.length > 0) {
            query = `UPDATE Clan_Na_Planu SET naziv_plana = ?, oib_trenera = ?, datum_pocetka_plana = ?, datum_isteka_plana = ? WHERE oib_clana = ?`;
            params = [naziv_plana, oib_trenera, formatted_pocetak, formatted_istek, oib_clana];
        } else {
            query = `INSERT INTO Clan_Na_Planu (oib_clana, naziv_plana, oib_trenera, datum_pocetka_plana, datum_isteka_plana) VALUES (?, ?, ?, ?, ?)`;
            params = [oib_clana, naziv_plana, oib_trenera, formatted_pocetak, formatted_istek];
        }

        await pool.query(query, params);

        res.status(200).json({
            message: existingClanNaPlanuEntry.length > 0 ? 'Plan uspješno ažuriran!' : 'Plan uspješno odabran!',
            datum_pocetka: formatted_pocetak,
            datum_isteka: formatted_istek
        });

    } catch (error) {
        console.error('Backend: Greška pri odabiru/ažuriranju plana člana:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Član već ima unos plana. Molimo ažurirajte postojeći unos.' });
        }
        res.status(500).json({ message: 'Došlo je do greške pri odabiru/ažuriranju plana.', error: error.message });
    }
});

// Ruta za dohvaćanje plana i trenera za člana (ZAŠTIĆENA)
app.get("/api/clanovi/:oib_clana/clan-na-planu", authenticateToken, async (req, res) => {
    console.log('Backend: GET /api/clanovi/:oib_clana/clan-na-planu route reached.'); // DEBUG LOG
    const oib_clana = req.params.oib_clana;

    // PROMJENA: Uklonjena stroga provjera uloge/OIB-a
    // Sada svi prijavljeni korisnici (član, trener, admin) mogu vidjeti plan člana.

    if (!oib_clana) {
        return res.status(400).json({ message: 'OIB člana je obavezan.' });
    }

    try {
        const query = `
            SELECT
                cnp.naziv_plana,
                cnp.datum_pocetka_plana,
                cnp.datum_isteka_plana,
                t.ime_trenera,
                t.prezime_trenera,
                t.email_trenera,
                t.tel_broj_trenera,
                t.strucnost
            FROM
                Clan_Na_Planu cnp
            JOIN
                Trener t ON cnp.oib_trenera = t.oib_trenera
            WHERE
                cnp.oib_clana = ?;
        `;
        const [results] = await pool.query(query, [oib_clana]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Nema unosa plana za ovog člana.' });
        }

        res.status(200).json({ clanNaPlanuEntry: results[0] });

    } catch (error) {
        console.error('Backend: Greška pri dohvaćanju unosa plana člana:', error);
        res.status(500).json({ message: 'Došlo je do greške pri dohvaćanju unosa plana.', error: error.message });
    }
});

// Spremanje unosa napretka člana (ZAŠTIĆENA)
app.post("/api/napredak", authenticateToken, async (req, res) => {
    console.log('Backend: POST /api/napredak route reached.'); // DEBUG LOG
    const { oib_clana, datum_unosa, tezina, duzina_izvedbe_plana, kategorija_clana } = req.body;

    // Dodatna provjera: Samo korisnik s vlastitim OIB-om, trener ili admin može unijeti napredak
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.oib !== oib_clana) {
        console.log('Backend: Unauthorized access attempt to add progress by role/OIB mismatch.'); // DEBUG LOG
        return res.status(403).json({ message: 'Nemate dozvolu za unos napretka za ovog člana.' });
    }

    if (!oib_clana || !datum_unosa || tezina === undefined || tezina === null) {
        return res.status(400).json({ message: 'OIB člana, datum unosa i težina su obavezni.' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(datum_unosa)) {
        return res.status(400).json({ message: 'Datum unosa mora biti u formatuYYYY-MM-DD.' });
    }

    try {
        const query = `
            INSERT INTO Napredak_Clana (oib_clana, datum_unosa, tezina, duzina_izvedbe_plana, kategorija_clana)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [oib_clana, datum_unosa, tezina, duzina_izvedbe_plana || null, kategorija_clana || null];

        await pool.query(query, params);

        res.status(201).json({ message: 'Napredak uspješno spremljen!' });

    } catch (error) {
        console.error('Backend: Greška pri spremanju napretka:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Već ste unijeli napredak za ovaj datum.' });
        }
        res.status(500).json({ message: 'Došlo je do greške pri spremanju napretka.', error: error.message });
    }
});

// Dohvaćanje povijesti napretka za člana (ZAŠTIĆENA)
app.get("/api/clanovi/:oib_clana/napredak", authenticateToken, async (req, res) => {
    console.log('Backend: GET /api/clanovi/:oib_clana/napredak route reached.'); // DEBUG LOG
    const oib_clana = req.params.oib_clana;

    // PROMJENA: Uklonjena stroga provjera uloge/OIB-a
    // Sada svi prijavljeni korisnici (član, trener, admin) mogu vidjeti povijest napretka člana.

    if (!oib_clana) {
        return res.status(400).json({ message: 'OIB člana je obavezan.' });
    }

    try {
        const query = `
            SELECT datum_unosa, tezina, duzina_izvedbe_plana, kategorija_clana
            FROM Napredak_Clana
            WHERE oib_clana = ?
            ORDER BY datum_unosa DESC;
        `;
        const [results] = await pool.query(query, [oib_clana]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Nema unosa napretka za ovog člana.' });
        }

        res.status(200).json({ povijestNapretka: results });

    } catch (error) {
        console.error('Backend: Greška pri dohvaćanju povijesti napretka:', error);
        res.status(500).json({ message: 'Došlo je do greške pri dohvaćanju povijesti napretka.', error: error.message });
    }
});


// API ruta za integraciju Gemini AI chata s umjetnim kašnjenjem (ZAŠTIĆENA)
app.post("/api/chat", authenticateToken, async (req, res) => {
    console.log('Backend: POST /api/chat route reached.'); // DEBUG LOG
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Poruka je obavezna' });
        }

        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const chat = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        await new Promise((resolve) => setTimeout(resolve, 3000));

        res.json({ role: 'model', content: text });

    } catch (error) {
        console.error("Backend: Greška pri povezivanju s Gemini API-jem:", error);
        if (error.response && error.response.data) {
            console.error("Backend: Detalji greške Gemini API-ja:", error.response.data);
        } else if (error.message) {
            console.error("Backend: Poruka greške:", error.message);
        }
        res.status(500).json({ error: 'Nije uspjelo povezivanje s Gemini API-jem' });
    }
});

// API ruta za dodavanje novih trenera (ZAŠTIĆENA, SAMO ZA ADMINA)
app.post('/api/trainers', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    console.log('Backend: POST /api/trainers route reached.'); // DEBUG LOG
    const { ime_trenera, prezime_trenera, oib_trenera, email_trenera, tel_broj_trenera, specialnost, lozinka_trenera } = req.body;

    console.log('Backend: Podaci iz zahtjeva za unos trenera:', req.body);

    if (!ime_trenera || !prezime_trenera || !oib_trenera || !email_trenera || !tel_broj_trenera || !specialnost || !lozinka_trenera) {
        console.log('Backend: Greška: Nedostaju neki podaci za unos trenera');
        return res.status(400).json({ message: 'Svi podaci (ime trenera, prezime trenera, OIB, email, telefon, specijalnost, lozinka) su obavezni.' });
    }

    try {
        const saltRounds = 10;
        const hashiranaLozinka = await bcrypt.hash(lozinka_trenera, saltRounds);

        const query = `INSERT INTO Trener (oib_trenera, ime_trenera, prezime_trenera, strucnost, email_trenera, tel_broj_trenera, lozinka_trenera)
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await pool.query(query, [oib_trenera, ime_trenera, prezime_trenera, specialnost, email_trenera, tel_broj_trenera, hashiranaLozinka]);
        res.status(200).json({ message: 'Trener uspješno dodan!', oib_trenera: oib_trenera });
    } catch (err) {
        console.error('Backend: Greška pri unosu trenera:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Trener s tim OIB-om ili email adresom već postoji.' });
        }
        res.status(500).json({ message: 'Došlo je do greške pri unosu trenera.', error: err });
    }
});


// Pokretanje Express servera
app.listen(port, () => {
    console.log("Server radi na portu: " + port);
});
