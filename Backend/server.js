// server.js
const { app, connectToDatabase } = require('./indeks'); // Pretpostavljamo da je gornji kod u app.js

const port = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectToDatabase(); // Prvo se spoji na bazu
        app.listen(port, () => {
            console.log(`Server radi na portu: ${port}`);
        });
    } catch (error) {
        console.error("Nije moguće pokrenuti server:", error);
        process.exit(1); // Izađi ako se ne može spojiti na bazu
    }
}

// Pokreni server samo ako datoteka nije importirana (tj. ako je direktno pokrenuta)
// Ovo je korisno da se server ne pokreće automatski tijekom testiranja kada se app.js importira
if (require.main === module || process.env.NODE_ENV !== 'test') {
    startServer();
}
