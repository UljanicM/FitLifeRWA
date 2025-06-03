const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require('axios');
const mysql = require("mysql2/promise");
require('dotenv').config({ path: './info.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bcrypt = require('bcrypt');

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

// Ruta za dohvaćanje planova
app.get("/api/planovi", async (request, response) => {
    try {
        const [results] = await pool.query("SELECT * FROM Plan");
        response.send(results);
    } catch (error) {
        console.error('Greška pri dohvaćanju planova:', error);
        return response.status(500).send('Greška pri dohvaćanju planova.');
    }
});

// Ruta za dodavanje novih planova
app.post("/api/planovi", async (req, res) => {
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
        console.error('Greška pri dodavanju plana:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Plan s tim nazivom već postoji.' });
        }
        res.status(500).json({ message: 'Došlo je do greške pri dodavanju plana.', error: err.message });
    }
});


// Ruta za dohvaćanje trenera
app.get("/api/treneri", async (request, response) => {
    try {
        const [results] = await pool.query("SELECT Trener.ime_trenera AS ime, Trener.prezime_trenera AS prezime, Trener.strucnost, Trener.tel_broj_trenera AS telefon, Trener.email_trenera AS email, Trener.oib_trenera FROM Trener");
        response.send(results);
    } catch (error) {
        console.error('Greška pri dohvaćanju trenera:', error);
        return response.status(500).send('Greška pri dohvaćanju trenera.');
    }
});

// Ruta za dohvaćanje pojedinog trenera po OIB-u
app.get("/api/treneri/:oib_trenera", async (request, response) => {
    const oib_trenera = request.params.oib_trenera;
    try {
        const [results] = await pool.query("SELECT * FROM Trener WHERE oib_trenera = ?", [oib_trenera]);
        if (results.length === 0) {
            return response.status(404).send("Trener nije pronađen.");
        }
        response.send(results[0]);
    } catch (error) {
        console.error('Greška pri dohvaćanju trenera:', error);
        return response.status(500).send('Greška pri dohvaćanju trenera.');
    }
});

// API endpoint za registraciju člana
app.post("/api/registracija", async (req, res) => {
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
        console.error('Greška pri unosu člana/hashiranju lozinke:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('Član s tim OIB-om već postoji.');
        }
        res.status(500).send('Došlo je do greške prilikom obrade vaše registracije.');
    }
});

// API ruta za prijavu člana
app.post("/api/login", async (req, res) => {
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

            if (clan.email_clana === "safarekerik@gmail.com" || clan.oib_clana === "muljanic") {
                clanDataToSend.role = "admin";
            }
            res.status(200).send({ message: "Prijava uspješna", clan: clanDataToSend });
        } else {
            res.status(401).send("Pogrešan email ili lozinka.");
        }
    } catch (error) {
        console.error('Greška pri provjeri/usporedbi lozinki:', error);
        res.status(500).send('Došlo je do greške prilikom prijave.');
    }
});

// API ruta za prijavu trenera
app.post("/api/trainer/login", async (req, res) => {
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
            trainerDataToSend.role = "trainer";
            res.status(200).send({ message: "Prijava trenera uspješna", trainer: trainerDataToSend });
        } else {
            res.status(401).send("Pogrešan email ili lozinka za trenera.");
        }
    } catch (error) {
        console.error('Greška pri provjeri/usporedbi lozinki trenera:', error);
        res.status(500).send('Došlo je do greške prilikom prijave trenera.');
    }
});


// API ruta za dohvaćanje podataka profila pojedinog člana
app.get("/api/clan/:oib_clana", async (req, res) => {
    const oib_clana = req.params.oib_clana;
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
        console.error('Greška pri dohvaćanju člana:', error);
        return res.status(500).send('Greška pri dohvaćanju podataka o članu.');
    }
});

// API ruta za ažuriranje podataka profila člana
app.put("/api/clan/:oib_clana", async (req, res) => {
    const oib_clana = req.params.oib_clana;
    const { ime_clana, prezime_clana, email_clana, tel_broj_clana, kilaza, kategorija } = req.body;

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
        console.error('Greška pri ažuriranju člana:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('Email adresa je već u upotrebi.');
        }
        res.status(500).send('Greška pri ažuriranju podataka o članu.');
    }
});

// API ruta za dohvaćanje svih članova (za pretraživanje)
app.get("/api/clanovi", async (request, response) => {
    try {
        const [results] = await pool.query(
            "SELECT oib_clana, ime_clana, prezime_clana, email_clana, tel_broj_clana, kilaza, kategorija FROM Clan"
        );
        response.status(200).send({ clanovi: results });
    } catch (error) {
        console.error('Greška pri dohvaćanju članova:', error);
        return response.status(500).send('Greška pri dohvaćanju članova.');
    }
});

// API za odabir plana i trenera za člana
app.post("/api/clanovi/odabir-plana", async (req, res) => {
    const { oib_clana, naziv_plana, oib_trenera } = req.body;

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

        // Preimenovano: Clan_Aktivni_Plan -> Clan_Na_Planu
        const [existingClanNaPlanuEntry] = await pool.query("SELECT * FROM Clan_Na_Planu WHERE oib_clana = ?", [oib_clana]);

        let query;
        let params;

        if (existingClanNaPlanuEntry.length > 0) {
            // Preimenovano: Clan_Aktivni_Plan -> Clan_Na_Planu
            query = `UPDATE Clan_Na_Planu SET naziv_plana = ?, oib_trenera = ?, datum_pocetka_plana = ?, datum_isteka_plana = ? WHERE oib_clana = ?`;
            params = [naziv_plana, oib_trenera, formatted_pocetak, formatted_istek, oib_clana];
        } else {
            // Preimenovano: Clan_Aktivni_Plan -> Clan_Na_Planu
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
        console.error('Greška pri odabiru/ažuriranju plana člana:', error);
        // Ažurirana poruka
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Član već ima unos plana. Molimo ažurirajte postojeći unos.' });
        }
        res.status(500).json({ message: 'Došlo je do greške pri odabiru/ažuriranju plana.', error: error.message });
    }
});

// Ruta za dohvaćanje plana i trenera za člana (preimenovana ruta i varijable)
app.get("/api/clanovi/:oib_clana/clan-na-planu", async (req, res) => { // Preimenovana ruta
    const oib_clana = req.params.oib_clana;

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
                Clan_Na_Planu cnp  -- Preimenovano: Clan_Aktivni_Plan -> Clan_Na_Planu
            JOIN
                Trener t ON cnp.oib_trenera = t.oib_trenera
            WHERE
                cnp.oib_clana = ?;
        `;
        const [results] = await pool.query(query, [oib_clana]);

        if (results.length === 0) {
            // Ažurirana poruka
            return res.status(404).json({ message: 'Nema unosa plana za ovog člana.' });
        }

        // Preimenovana varijabla
        res.status(200).json({ clanNaPlanuEntry: results[0] });

    } catch (error) {
        console.error('Greška pri dohvaćanju unosa plana člana:', error); // Ažurirana poruka
        res.status(500).json({ message: 'Došlo je do greške pri dohvaćanju unosa plana.', error: error.message }); // Ažurirana poruka
    }
});

// Spremanje unosa napretka člana
app.post("/api/napredak", async (req, res) => {
    const { oib_clana, datum_unosa, tezina, duzina_izvedbe_plana, kategorija_clana } = req.body;

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
        console.error('Greška pri spremanju napretka:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Već ste unijeli napredak za ovaj datum.' });
        }
        res.status(500).json({ message: 'Došlo je do greške pri spremanju napretka.', error: error.message });
    }
});

// Dohvaćanje povijesti napretka za člana
app.get("/api/clanovi/:oib_clana/napredak", async (req, res) => {
    const oib_clana = req.params.oib_clana;

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
        console.error('Greška pri dohvaćanju povijesti napretka:', error);
        res.status(500).json({ message: 'Došlo je do greške pri dohvaćanju povijesti napretka.', error: error.message });
    }
});


// API ruta za integraciju Gemini AI chata s umjetnim kašnjenjem
app.post("/api/chat", async (req, res) => {
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
        console.error("Greška pri povezivanju s Gemini API-jem:", error);
        if (error.response && error.response.data) {
            console.error("Detalji greške Gemini API-ja:", error.response.data);
        } else if (error.message) {
            console.error("Poruka greške:", error.message);
        }
        res.status(500).json({ error: 'Nije uspjelo povezivanje s Gemini API-jem' });
    }
});

// API ruta za dodavanje novih trenera
app.post('/api/trainers', async (req, res) => {
    const { ime_trenera, prezime_trenera, oib_trenera, email_trenera, tel_broj_trenera, specialnost, lozinka_trenera } = req.body;

    console.log('Podaci iz zahtjeva za unos trenera:', req.body);

    if (!ime_trenera || !prezime_trenera || !oib_trenera || !email_trenera || !tel_broj_trenera || !specialnost || !lozinka_trenera) {
        console.log('Greška: Nedostaju neki podaci za unos trenera');
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
        console.error('Greška pri unosu trenera:', err);
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
