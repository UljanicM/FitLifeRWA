// cypress/e2e/korisnicki_tok.cy.js

describe('Korisnički Tok - Registracija, Prijava, Uređivanje Profila, Odjava', () => {
  const jedinstveniEmail = `test${Date.now()}@example.com`;
  const jedinstveniOIB = `${Math.floor(10000000000 + Math.random() * 90000000000)}`;

  const korisnik = {
    ime: 'Pero',
    prezime: 'Perić',
    oib: jedinstveniOIB,
    email: jedinstveniEmail,
    lozinka: 'Lozinka123', // Mora zadovoljiti pravila iz RegistracijaPage
  };

  const novoKorisnickoIme = 'Pero';
  const novaKorisnickaKilazaZaUnos = "75"; // Vrijednost koju unosimo
  const ocekivanaKilazaFormatirano = "75.00"; // Vrijednost koju očekujemo u inputu i vjerojatno u storageu

  before(() => {

  });

  it('Treba uspješno provesti korisnika kroz registraciju, prijavu, uređivanje profila i odjavu', () => {
    // 1. REGISTRACIJA
    cy.visit('/#/registracija'); // Koristi hash putanju ako je Vue Router u hash modu
    cy.log('--- Navigirao na /#/registracija ---');

    // Pričekaj da se pojavi naslov forme unutar kartice

    // Koristi data-cy atribute za veću stabilnost testova
    cy.get('[data-cy="registracija-ime-input"]').type(korisnik.ime);
    cy.get('[data-cy="registracija-prezime-input"]').type(korisnik.prezime);
    cy.get('[data-cy="registracija-oib-input"]').type(korisnik.oib);
    cy.get('[data-cy="registracija-email-input"]').type(korisnik.email);
    cy.get('[data-cy="registracija-lozinka-input"]').type(korisnik.lozinka);
    cy.get('[data-cy="registracija-potvrda-lozinke-input"]').type(korisnik.lozinka);

    cy.get('[data-cy="registracija-submit-btn"]').click();

    cy.contains('Registracija uspješna! Sada se možete prijaviti.', { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/#/loginpage');
    cy.log('--- Registracija uspješna ---');

    // 2. PRIJAVA
    cy.log('--- Započinjem prijavu ---');
    // Već smo na /#/loginpage

    cy.get('[data-cy="login-email-input"]').type(korisnik.email);
    cy.get('[data-cy="login-lozinka-input"]').type(korisnik.lozinka);
    cy.get('[data-cy="login-submit-btn"]').click();

    cy.contains('Prijava uspješna!', { timeout: 10000 }).should('be.visible');
    cy.window().its('localStorage.token').should('exist');
    cy.url().should('not.include', '/#/loginpage'); // Preusmjerava na '/' ili '/admin'
    cy.log('--- Prijava uspješna ---');

    // 3. NAVIGACIJA NA STRANICU PROFILA I ULAZAK U EDIT MODE
    cy.log('--- Navigacija na profil i ulazak u edit mode ---');
    // Preporuka: Dodaj data-cy atribute i na elemente u MainLayout.vue
    cy.get('button[aria-label="Menu"]').click({force: true}); // Može se zamijeniti s data-cy
    cy.get('.q-drawer .q-item').contains('Profil').click({force: true}); // Može se zamijeniti s data-cy
    cy.url().should('include', '/#/profil');

    // Preporuka: Dodaj data-cy="uredi-profil-btn" na gumb u KorisnickiProfilPage.vue
    cy.get('button').contains('Uredi Profil').click();
    cy.log('--- U edit mode-u na stranici profila ---');

    // 4. UREĐIVANJE PROFILA (na stranici /#/profil)
    cy.log('--- Započinjem uređivanje profila ---');
    // Preporuka: Dodaj data-cy atribute i na inpute u KorisnickiProfilPage.vue
    // Koristit ćemo aria-label kao fallback ako data-cy nisu dodani
    cy.get('input[aria-label="Ime"]').should('have.value', korisnik.ime);
    cy.get('input[aria-label="Ime"]').clear().type(novoKorisnickoIme);
    cy.get('input[aria-label="Kilaza (kg)"]').clear().type(novaKorisnickaKilazaZaUnos);

    // Preporuka: Dodaj data-cy="spremi-promjene-btn"
    cy.get('button').contains('Spremi Promjene').click();

    cy.url().should('include', '/#/profil'); // Ostajemo na /profil



    // Ispravljena provjera localStorage za Quasar
    cy.window().then((win) => {
      let rawStoredClan = win.localStorage.getItem('clan');
      cy.log('Sirova vrijednost iz localStorage za "clan":', rawStoredClan);

      if (rawStoredClan === null || rawStoredClan === 'undefined' || rawStoredClan === 'null') {
        throw new Error(`LocalStorage 'clan' sadrži neispravnu vrijednost ili nedostaje: "${rawStoredClan}"`);
      }

      const quasarPrefix = "__q_objt|";
      let jsonStringToParse = rawStoredClan;
      if (rawStoredClan.startsWith(quasarPrefix)) {
        jsonStringToParse = rawStoredClan.substring(quasarPrefix.length);
        cy.log('Uklonjen Quasar prefiks, string za parsiranje:', jsonStringToParse);
      }

      let clanData;
      try {
        clanData = JSON.parse(jsonStringToParse);
      } catch (e) {
        throw new Error(`Greška pri parsiranju JSON-a iz localStorage 'clan'. Vrijednost za parsiranje: "${jsonStringToParse}". Originalna sirova vrijednost: "${rawStoredClan}". Originalna greška: ${e.message}`);
      }

      if (clanData === null) {
          throw new Error(`Parsirani podaci za 'clan' iz localStorage su null. String za parsiranje je bio: "${jsonStringToParse}". Originalna sirova vrijednost: "${rawStoredClan}".`);
      }

    });
    cy.log('--- Uređivanje profila uspješno ---');

    // 5. ODJAVA
    cy.log('--- Započinjem odjavu ---');
    cy.get('button[aria-label="Menu"]').click({force: true}); // Može se zamijeniti s data-cy
    // Preporuka: Dodaj data-cy="odjava-link"
    cy.get('.q-drawer .q-item').contains('Odjava').click({force: true});
    // Potvrdi odjavu u Quasar dialogu
    cy.get('.q-dialog button').contains('Da').click();


    cy.url().should('include', '/#/loginpage');
    cy.log('--- Odjava uspješna ---');
  });
});
