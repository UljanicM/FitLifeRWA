// Backend/indeks.js
console.log('--- Pokrećem indeks.js ---'); // NOVI LOG

const express = require("express");
const app = express(); // Ovdje definiramo app
const cors = require("cors");
// Greška u originalnom kodu, treba biti require('body-parser')
// const bodyParser = "body-parser"; // ZAKOMENTIRANO - ISPRAVLJENO ISPOD
const axios = require('axios');
const mysql = require("mysql2/promise");
require('dotenv').config({ path: './info.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Dohvati JWT tajni ključ iz .env datoteke
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('!!! Greška: JWT_SECRET nije definiran u info.env datoteci! Backend se možda neće ispravno pokrenuti ili autentifikacija neće raditi.');
    // U testnom okruženju nećemo nužno prekidati aplikaciju, Jest će prijaviti grešku
    // process.exit(1); // Razmisli želiš li prekidati aplikaciju ovdje u produkciji
} else {
    console.log('--- JWT_SECRET uspješno učitan. ---');
}

app.use(cors({"origin": "*"}));

// Ispravak za bodyParser
const actualBodyParser = require('body-parser');
app.use(actualBodyParser.json());
app.use(actualBodyParser.urlencoded({ extended: true }));
console.log('--- Middleware (cors, bodyParser) postavljen. ---');

let pool; // Definiramo pool varijablu

async function connectToDatabase() {
    console.log('--- Ulazim u connectToDatabase ---');
    if (process.env.NODE_ENV === 'test') {
        console.log("Testno okruženje: Preskačem stvarno povezivanje s bazom.");
        pool = {
            query: async () => {
                console.warn("Pozvana lažna pool.query funkcija. Jeste li zaboravili mockati bazu podataka?");
                return [[]];
            },
            execute: async () => {
                console.warn("Pozvana lažna pool.execute funkcija. Jeste li zaboravili mockati bazu podataka?");
                return [[]];
            }
        };
        console.log('--- connectToDatabase: Testno okruženje - lažni pool postavljen. ---');
        return pool;
    }
    try {
        console.log('--- connectToDatabase: Pokušavam se spojiti na produkcijsku/razvojnu bazu... ---');
        console.log(`--- DB Host: ${process.env.DB_HOST || 'ucka.veleri.hr'}, DB User: ${process.env.DB_USER || 'muljanic'}, DB Name: ${process.env.DB_NAME || 'muljanic'} ---`);
        pool = await mysql.createPool({
            host: process.env.DB_HOST || 'ucka.veleri.hr',
            user: process.env.DB_USER || 'muljanic',
            password: process.env.DB_PASSWORD || '11', // Lozinka se ne logira iz sigurnosnih razloga
            database: process.env.DB_NAME || 'muljanic',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log("Povezano s MySQL-om!"); // POSTOJEĆI LOG
        console.log('--- connectToDatabase: Uspješno spojeno na bazu. ---');
        return pool;
    } catch (err) {
        console.error('!!! Greška u connectToDatabase pri povezivanju s bazom podataka !!!:', err.message);
        console.error('Stack trace greške iz connectToDatabase:', err.stack);
        // U testnom okruženju, Jest će uhvatiti ovu grešku ako se dogodi
        if (process.env.NODE_ENV !== 'test') {
            console.log('--- connectToDatabase: Izlazim iz procesa zbog greške u spajanju na bazu (non-test env). ---');
            process.exit(1);
        }
        throw err; // Ponovno baci grešku da je testovi mogu uhvatiti
    }
}

// Izvozimo funkciju kako bismo je mogli pozvati u server.js ili mockati u testovima
// connectToDatabase(); // Ne pozivamo odmah, nego u server.js
console.log('--- connectToDatabase funkcija definirana. ---');

app.use(express.urlencoded({ extended: true }));
console.log('--- Middleware (express.urlencoded) postavljen. ---');

// Middleware za provjeru JWT-a i autentifikaciju
function authenticateToken(req, res, next) {
    // console.log('--- authenticateToken middleware pozvan. NODE_ENV:', process.env.NODE_ENV); // Manje bučan log
    if (process.env.NODE_ENV === 'test') {
        // console.log('--- authenticateToken: Testno okruženje, preskačem autentifikaciju, postavljam mock usera. ---');
        req.user = { role: 'admin', oib: 'test-oib' };
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        // console.log('--- authenticateToken: Token nije pronađen. Status 401. ---');
        return res.status(401).json({ message: 'Autorizacijski token nije pronađen.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // console.error('--- authenticateToken: Greška pri verifikaciji tokena. Status 403. ---', err.message);
            return res.status(403).json({ message: 'Token je nevažeći ili istekao.' });
        }
        req.user = user;
        // console.log('--- authenticateToken: Token uspješno verificiran. User:', user.oib, user.role);
        next();
    });
}
console.log('--- authenticateToken middleware definiran. ---');

// Middleware za provjeru uloge
function authorizeRole(roles) {
    return (req, res, next) => {
        // console.log('--- authorizeRole middleware pozvan. User role:', req.user?.role, 'Required roles:', roles);
        if (!req.user || !req.user.role) {
            // console.log('--- authorizeRole: Nema informacija o ulozi. Status 403. ---');
            return res.status(403).json({ message: 'Nema informacija o ulozi korisnika u tokenu.' });
        }
        if (!roles.includes(req.user.role)) {
            // console.log('--- authorizeRole: Korisnik nema potrebnu ulogu. Status 403. ---');
            return res.status(403).json({ message: `Nemate potrebnu ulogu (${roles.join(', ')}) za pristup ovoj ruti.` });
        }
        // console.log('--- authorizeRole: Korisnik autoriziran za ulogu. ---');
        next();
    };
}
console.log('--- authorizeRole middleware definiran. ---');

// --- API RUTE ---
console.log('--- Definiranje API ruta... ---');

// Ruta za dohvaćanje planova (ZAŠTIĆENA)
app.get("/api/planovi", authenticateToken, async (request, response) => {
    // console.log('--- GET /api/planovi pozvan ---');
    try {
        if (!pool) {
            console.error('Backend GET /api/planovi: Pool nije inicijaliziran.');
            return response.status(500).send('Greška servera: Baza podataka nije dostupna.');
        }
        const [results] = await pool.query("SELECT * FROM Plan");
        response.send(results);
    } catch (error) {
        console.error('Backend GET /api/planovi: Greška pri dohvaćanju planova:', error.message);
        return response.status(500).send('Greška pri dohvaćanju planova.');
    }
});

// Ruta za dodavanje novih planova (ZAŠTIĆENA, SAMO ZA ADMINA ILI TRENERA)
app.post("/api/planovi", authenticateToken, authorizeRole(['admin', 'trainer']), async (req, res) => {
    // console.log('--- POST /api/planovi pozvan ---');
    const { naziv_plana, cijena_plana, trajanje_plana, prehrana, kategorija_plana } = req.body;

    if (!naziv_plana || cijena_plana === undefined || trajanje_plana === undefined || !prehrana || !kategorija_plana) {
        return res.status(400).json({ message: 'Svi podaci za plan su obavezni.' });
    }
     if (!pool) {
        console.error('Backend POST /api/planovi: Pool nije inicijaliziran.');
        return res.status(500).send('Greška servera: Baza podataka nije dostupna.');
    }
    try {
        const query = `INSERT INTO Plan (naziv_plana, cijena_plana, trajanje_plana, prehrana, kategorija_plana)
                       VALUES (?, ?, ?, ?, ?)`;
        const [result] = await pool.query(query, [naziv_plana, cijena_plana, trajanje_plana, prehrana, kategorija_plana]);
        res.status(201).json({ message: 'Plan uspješno dodan!', id: result.insertId });
    } catch (err) {
        console.error('Backend POST /api/planovi: Greška pri dodavanju plana:', err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Plan s tim nazivom već postoji.' });
        }
        res.status(500).json({ message: 'Došlo je do greške pri dodavanju plana.', error: err.message });
    }
});


// Ruta za dohvaćanje trenera (ZAŠTIĆENA)
app.get("/api/treneri", authenticateToken, async (request, response) => {
    // console.log('--- GET /api/treneri pozvan ---');
    if (!pool) {
        console.error('Backend GET /api/treneri: Pool nije inicijaliziran.');
        return response.status(500).send('Greška servera: Baza podataka nije dostupna.');
    }
    try {
        const [results] = await pool.query("SELECT Trener.ime_trenera AS ime, Trener.prezime_trenera AS prezime, Trener.strucnost, Trener.tel_broj_trenera AS telefon, Trener.email_trenera AS email, Trener.oib_trenera FROM Trener");
        response.send(results);
    } catch (error) {
        console.error('Backend GET /api/treneri: Greška pri dohvaćanju trenera:', error.message);
        return response.status(500).send('Greška pri dohvaćanju trenera.');
    }
});

// Ruta za dohvaćanje pojedinog trenera po OIB-u (ZAŠTIĆENA)
app.get("/api/treneri/:oib_trenera", authenticateToken, async (request, response) => {
    // console.log(`--- GET /api/treneri/${request.params.oib_trenera} pozvan ---`);
    const oib_trenera = request.params.oib_trenera;
     if (!pool) {
        console.error(`Backend GET /api/treneri/${oib_trenera}: Pool nije inicijaliziran.`);
        return response.status(500).send('Greška servera: Baza podataka nije dostupna.');
    }
    try {
        const [results] = await pool.query("SELECT * FROM Trener WHERE oib_trenera = ?", [oib_trenera]);
        if (results.length === 0) {
            return response.status(404).send("Trener nije pronađen.");
        }
        response.send(results[0]);
    } catch (error) {
        console.error(`Backend GET /api/treneri/${oib_trenera}: Greška pri dohvaćanju trenera:`, error.message);
        return response.status(500).send('Greška pri dohvaćanju trenera.');
    }
});

// API endpoint za registraciju člana (JAVNA)
app.post("/api/registracija", async (req, res) => {
    // console.log('--- POST /api/registracija pozvan ---');
    const { oib, email, name, password, prezime } = req.body;

    const oib_clana = oib;
    const email_clana = email;
    const ime_clana = name;
    const prezime_clana = prezime;

    if (!oib_clana || !email_clana || !ime_clana || !prezime_clana || !password) {
      return res.status(400).send("OIB, email, ime, prezime i lozinka su obavezni.");
    }
     if (!pool) {
        console.error('Backend POST /api/registracija: Pool nije inicijaliziran.');
        return res.status(500).send('Greška servera: Baza podataka nije dostupna.');
    }
    try {
      const saltRounds = 10;
      const hashiranaLozinka = await bcrypt.hash(password, saltRounds);

      const query = 'INSERT INTO Clan (oib_clana, email_clana, ime_clana, prezime_clana, lozinka_clana) VALUES (?, ?, ?, ?, ?)';

      await pool.query(query, [oib_clana, email_clana, ime_clana, prezime_clana, hashiranaLozinka]);
      res.status(200).send("Član uspješno registriran.");
    } catch (error) {
      console.error('Backend POST /api/registracija: Greška pri unosu člana/hashiranju lozinke:', error.message);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).send('Član s tim OIB-om već postoji.');
      }
      res.status(500).send('Došlo je do greške prilikom obrade vaše registracije.');
    }
});

// API ruta za prijavu člana (JAVNA - sada izdaje JWT)
app.post("/api/login", async (req, res) => {
    // console.log('--- POST /api/login pozvan ---');
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email i lozinka su obavezni.");
    }

    const email_clana = email;
     if (!pool) {
        console.error('Backend POST /api/login: Pool nije inicijaliziran.');
        return res.status(500).send('Greška servera: Baza podataka nije dostupna.');
    }
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

            let role = "member";
            // Hardkodirano dodjeljivanje admin uloge na temelju emaila
            if (clan.email_clana === "safarekerik@gmail.com" || clan.email_clana === "muljanic@gmail.com") {
                role = "admin";
            }
            clanDataToSend.role = role;

            const token = jwt.sign(
                { oib: clan.oib_clana, email: clan.email_clana, role: role },
                JWT_SECRET, // Osiguraj da je JWT_SECRET definiran
                { expiresIn: '1h' }
            );
            res.status(200).send({ message: "Prijava uspješna", clan: clanDataToSend, token: token });
        } else {
            res.status(401).send("Pogrešan email ili lozinka.");
        }
    } catch (error) {
        console.error('Backend POST /api/login: Greška pri provjeri/usporedbi lozinki:', error.message);
        res.status(500).send('Došlo je do greške prilikom prijave.');
    }
});

// API ruta za prijavu trenera (JAVNA - sada izdaje JWT)
app.post("/api/trainer/login", async (req, res) => {
    // console.log('--- POST /api/trainer/login pozvan ---');
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email i lozinka su obavezni.");
    }

    const email_trenera = email;
     if (!pool) {
        console.error('Backend POST /api/trainer/login: Pool nije inicijaliziran.');
        return res.status(500).send('Greška servera: Baza podataka nije dostupna.');
    }
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
            trainerDataToSend.role = "trainer";

            const token = jwt.sign(
                { oib: trainer.oib_trenera, email: trainer.email_trenera, role: "trainer" },
                JWT_SECRET, // Osiguraj da je JWT_SECRET definiran
                { expiresIn: '1h' }
            );
            res.status(200).send({ message: "Prijava trenera uspješna", trainer: trainerDataToSend, token: token });
        } else {
            res.status(401).send("Pogrešan email ili lozinka za trenera.");
        }
    } catch (error) {
        console.error('Backend POST /api/trainer/login: Greška pri provjeri/usporedbi lozinki trenera:', error.message);
        res.status(500).send('Došlo je do greške prilikom prijave trenera.');
    }
});


// API ruta za dohvaćanje podataka profila pojedinog člana (ZAŠTIĆENA)
app.get("/api/clan/:oib_clana", authenticateToken, async (req, res) => {
    // console.log(`--- GET /api/clan/${req.params.oib_clana} pozvan ---`);
    const oib_clana = req.params.oib_clana;
     if (!pool) {
        console.error(`Backend GET /api/clan/${oib_clana}: Pool nije inicijaliziran.`);
        return res.status(500).send('Greška servera: Baza podataka nije dostupna.');
    }
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
        console.error(`Backend GET /api/clan/${oib_clana}: Greška pri dohvaćanju člana:`, error.message);
        return res.status(500).send('Greška pri dohvaćanju podataka o članu.');
    }
});

// API ruta za ažuriranje podataka profila člana (ZAŠTIĆENA)
app.put("/api/clan/:oib_clana", authenticateToken, async (req, res) => {
    // console.log(`--- PUT /api/clan/${req.params.oib_clana} pozvan ---`);
    const oib_clana = req.params.oib_clana;
    const { ime_clana, prezime_clana, email_clana, tel_broj_clana, kilaza, kategorija } = req.body;

    if (req.user.role !== 'admin' && req.user.oib !== oib_clana) {
        return res.status(403).json({ message: 'Nemate dozvolu za ažuriranje ovog profila.' });
    }

    if (!ime_clana || !prezime_clana || !email_clana) {
        return res.status(400).send("Ime, prezime i email su obavezni za ažuriranje.");
    }
     if (!pool) {
        console.error(`Backend PUT /api/clan/${oib_clana}: Pool nije inicijaliziran.`);
        return res.status(500).send('Greška servera: Baza podataka nije dostupna.');
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
        console.error(`Backend PUT /api/clan/${oib_clana}: Greška pri ažuriranju člana:`, error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('Email adresa je već u upotrebi.');
        }
        res.status(500).send('Greška pri ažuriranju podataka o članu.');
    }
});

// API ruta za dohvaćanje svih članova (za pretraživanje) (ZAŠTIĆENA)
app.get("/api/clanovi", authenticateToken, async (request, response) => {
    // console.log('--- GET /api/clanovi pozvan ---');
     if (!pool) {
        console.error('Backend GET /api/clanovi: Pool nije inicijaliziran.');
        return response.status(500).send('Greška servera: Baza podataka nije dostupna.');
    }
    try {
        const [results] = await pool.query(
            "SELECT oib_clana, ime_clana, prezime_clana, email_clana, tel_broj_clana, kilaza, kategorija FROM Clan"
        );
        response.status(200).send({ clanovi: results });
    } catch (error) {
        console.error('Backend GET /api/clanovi: Greška pri dohvaćanju članova:', error.message);
        return response.status(500).send('Greška pri dohvaćanju članova.');
    }
});

// API za odabir plana i trenera za člana (ZAŠTIĆENA)
app.post("/api/clanovi/odabir-plana", authenticateToken, async (req, res) => {
    // console.log('--- POST /api/clanovi/odabir-plana pozvan ---');
    const { oib_clana, naziv_plana, oib_trenera } = req.body;

    if (req.user.role !== 'admin' && req.user.oib !== oib_clana) {
        return res.status(403).json({ message: 'Nemate dozvolu za odabir plana za ovog člana.' });
    }

    if (!oib_clana || !naziv_plana || !oib_trenera) {
        return res.status(400).json({ message: 'OIB člana, naziv plana i OIB trenera su obavezni.' });
    }
     if (!pool) {
        console.error('Backend POST /api/clanovi/odabir-plana: Pool nije inicijaliziran.');
        return res.status(500).send('Greška servera: Baza podataka nije dostupna.');
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
        console.error('Backend POST /api/clanovi/odabir-plana: Greška pri odabiru/ažuriranju plana člana:', error.message);
        if (error.code === 'ER_DUP_ENTRY' && existingClanNaPlanuEntry.length === 0) {
             return res.status(409).json({ message: 'Član već ima dodijeljen plan. Ažurirajte postojeći unos.' });
        }
        res.status(500).json({ message: 'Došlo je do greške pri odabiru/ažuriranju plana.', error: error.message });
    }
});

// Ruta za dohvaćanje plana i trenera za člana (ZAŠTIĆENA)
app.get("/api/clanovi/:oib_clana/clan-na-planu", authenticateToken, async (req, res) => {
    // console.log(`--- GET /api/clanovi/${req.params.oib_clana}/clan-na-planu pozvan ---`);
    const oib_clana = req.params.oib_clana;

    if (!oib_clana) {
        return res.status(400).json({ message: 'OIB člana je obavezan.' });
    }
     if (!pool) {
        console.error(`Backend GET /api/clanovi/${oib_clana}/clan-na-planu: Pool nije inicijaliziran.`);
        return res.status(500).send('Greška servera: Baza podataka nije dostupna.');
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
        console.error(`Backend GET /api/clanovi/${oib_clana}/clan-na-planu: Greška pri dohvaćanju unosa plana člana:`, error.message);
        res.status(500).json({ message: 'Došlo je do greške pri dohvaćanju unosa plana.', error: error.message });
    }
});

// Spremanje unosa napretka člana (ZAŠTIĆENA)
app.post("/api/napredak", authenticateToken, async (req, res) => {
    // console.log('--- POST /api/napredak pozvan ---');
    const { oib_clana, datum_unosa, tezina, duzina_izvedbe_plana, kategorija_clana } = req.body;

    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.oib !== oib_clana) {
        return res.status(403).json({ message: 'Nemate dozvolu za unos napretka za ovog člana.' });
    }

    if (!oib_clana || !datum_unosa || tezina === undefined || tezina === null) {
        return res.status(400).json({ message: 'OIB člana, datum unosa i težina su obavezni.' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(datum_unosa)) {
        return res.status(400).json({ message: 'Datum unosa mora biti u formatu YYYY-MM-DD.' }); // Ispravljen format datuma
    }
     if (!pool) {
        console.error('Backend POST /api/napredak: Pool nije inicijaliziran.');
        return res.status(500).send('Greška servera: Baza podataka nije dostupna.');
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
        console.error('Backend POST /api/napredak: Greška pri spremanju napretka:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Već ste unijeli napredak za ovaj datum.' });
        }
        res.status(500).json({ message: 'Došlo je do greške pri spremanju napretka.', error: error.message });
    }
});

// Dohvaćanje povijesti napretka za člana (ZAŠTIĆENA)
app.get("/api/clanovi/:oib_clana/napredak", authenticateToken, async (req, res) => {
    // console.log(`--- GET /api/clanovi/${req.params.oib_clana}/napredak pozvan ---`);
    const oib_clana = req.params.oib_clana;

    if (!oib_clana) {
        return res.status(400).json({ message: 'OIB člana je obavezan.' });
    }
     if (!pool) {
        console.error(`Backend GET /api/clanovi/${oib_clana}/napredak: Pool nije inicijaliziran.`);
        return res.status(500).send('Greška servera: Baza podataka nije dostupna.');
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
        console.error(`Backend GET /api/clanovi/${oib_clana}/napredak: Greška pri dohvaćanju povijesti napretka:`, error.message);
        res.status(500).json({ message: 'Došlo je do greške pri dohvaćanju povijesti napretka.', error: error.message });
    }
});


// API ruta za integraciju Gemini AI chata (ZAŠTIĆENA)
app.post("/api/chat", authenticateToken, async (req, res) => {
    // console.log('--- POST /api/chat pozvan ---');
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Poruka je obavezna' });
        }

        if (process.env.NODE_ENV === 'test') {
            // console.log('--- POST /api/chat: Testno okruženje, vraćam mockirani odgovor. ---');
            await new Promise((resolve) => setTimeout(resolve, 100));
            return res.json({ role: 'model', content: `Testni odgovor na: ${message}` });
        }

        // console.log('--- POST /api/chat: Produkcijsko/razvojno okruženje, kontaktiram Gemini AI. ---');
        const genAI = new GoogleGenerativeAI(process.env.API_KEY); // Osiguraj da je API_KEY definiran
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const chat = model.startChat({
            history: [],
            generationConfig: { maxOutputTokens: 500 },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        res.json({ role: 'model', content: text });

    } catch (error) {
        console.error("Backend POST /api/chat: Greška pri povezivanju s Gemini API-jem:", error.message);
        if (error.response && error.response.data) {
            console.error("Backend POST /api/chat: Detalji greške Gemini API-ja:", error.response.data);
        }
        res.status(500).json({ error: 'Nije uspjelo povezivanje s Gemini API-jem' });
    }
});

// API ruta za dodavanje novih trenera (ZAŠTIĆENA, SAMO ZA ADMINA)
app.post('/api/trainers', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    // console.log('--- POST /api/trainers pozvan ---');
    const { ime_trenera, prezime_trenera, oib_trenera, email_trenera, tel_broj_trenera, specialnost, lozinka_trenera } = req.body;

    if (!ime_trenera || !prezime_trenera || !oib_trenera || !email_trenera || !tel_broj_trenera || !specialnost || !lozinka_trenera) {
        return res.status(400).json({ message: 'Svi podaci (ime trenera, prezime trenera, OIB, email, telefon, specijalnost, lozinka) su obavezni.' });
    }
     if (!pool) {
        console.error('Backend POST /api/trainers: Pool nije inicijaliziran.');
        return res.status(500).send('Greška servera: Baza podataka nije dostupna.');
    }
    try {
        const saltRounds = 10;
        const hashiranaLozinka = await bcrypt.hash(lozinka_trenera, saltRounds);

        const query = `INSERT INTO Trener (oib_trenera, ime_trenera, prezime_trenera, strucnost, email_trenera, tel_broj_trenera, lozinka_trenera)
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;

        /* const [result] = */ await pool.query(query, [oib_trenera, ime_trenera, prezime_trenera, specialnost, email_trenera, tel_broj_trenera, hashiranaLozinka]);
        res.status(200).json({ message: 'Trener uspješno dodan!', oib_trenera: oib_trenera });
    } catch (err) {
        console.error('Backend POST /api/trainers: Greška pri unosu trenera:', err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Trener s tim OIB-om ili email adresom već postoji.' });
        }
        res.status(500).json({ message: 'Došlo je do greške pri unosu trenera.', error: err.message }); // Poslati err.message
    }
});
console.log('--- Sve API rute definirane. ---');

// Function to set a mock pool for testing
function setPool(mockPool) {
    // console.log('--- Pozvana funkcija setPool (za testiranje) ---');
    pool = mockPool;
}

// Helper function to hash a password
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Helper function to compare passwords
async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}
console.log('--- Pomoćne funkcije (setPool, hashPassword, comparePassword) definirane. ---');

// Export the functions
module.exports = { app, connectToDatabase, getPool: () => pool, setPool, hashPassword, comparePassword, JWT_SECRET };
console.log('--- Završavam indeks.js i izvozim module. ---');
