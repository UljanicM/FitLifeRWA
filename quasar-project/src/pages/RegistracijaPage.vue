<template>
  <q-page padding>
    <q-card class="q-pa-md" bordered>
      <q-card-section>
        <div class="text-h6 text-center q-mb-md">Registracija</div>

        <q-input
          v-model="imeKorisnika"
          label="Ime"
          filled
          class="q-mb-md"
          :dense="true"
        />

        <q-input
          v-model="OIB"
          label="OIB"
          filled
          class="q-mb-md"
          :dense="true"
        />

        <q-input
          v-model="email"
          label="Email"
          type="email"
          filled
          class="q-mb-md"
          :dense="true"
        />

        <q-input
          v-model="lozinka"
          label="Lozinka"
          type="password"
          filled
          class="q-mb-md"
          :dense="true"
        />

        <q-btn
          @click="registerUser"
          label="Registriraj se"
          color="primary"
          class="full-width q-mt-md"
          :loading="isLoading"
        />

        <q-banner v-if="errorMessage" class="q-mt-md bg-negative text-white" dense rounded>
          {{ errorMessage }}
        </q-banner>

        <q-banner v-if="successMessage" class="q-mt-md bg-positive text-white" dense rounded>
          {{ successMessage }}
        </q-banner>

      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import axios from "axios";
import { ref } from "vue";

export default {
  name: "RegistracijaPage",
  setup() {
    const imeKorisnika = ref("");      // Ranije 'name'
    const OIB = ref("");   // Ranije 'username', ovo će biti OIB koji se šalje kao 'username' backendu
    const email = ref("");
    const lozinka = ref("");         // Ranije 'password'
    const errorMessage = ref("");
    const successMessage = ref("");
    const isLoading = ref(false);

    const registerUser = async () => {
      errorMessage.value = "";
      successMessage.value = "";
      isLoading.value = true;

      // Provjera da li su svi podaci uneseni
      if (!imeKorisnika.value || !korisnickoIme.value || !email.value || !lozinka.value) {
        errorMessage.value = "Svi podaci su obavezni.";
        isLoading.value = false;
        return;
      }

      try {
        // Podaci koji se šalju backendu.
        // Backend očekuje:
        // - username: za oib_clana
        // - name: za ime_clana
        // - email: za email_clana
        // - password: za lozinka_clana
        const userData = {
          username: OIB.value, // Vrijednost iz "Korisničko ime (OIB)" polja
          name: imeKorisnika.value,       // Vrijednost iz "Ime" polja
          email: email.value,
          password: lozinka.value
        };

        // Slanje podataka na backend
        const response = await axios.post("http://localhost:3000/api/registracija", userData);
        console.log("Korisnik registriran:", response.data);

        successMessage.value = "Registracija uspješna! Sada se možete prijaviti.";
        // Resetiranje unosa
        imeKorisnika.value = "";
        OIB.value = "";
        email.value = "";
        lozinka.value = "";

      } catch (error) {
        console.error("Greška pri registraciji:", error);
        if (error.response && error.response.data) {
          // Backend šalje grešku kao običan tekst (res.send())
          errorMessage.value = error.response.data;
        } else if (error.request) {
          // Zahtjev je poslan, ali nije primljen odgovor
          errorMessage.value = "Nije moguće kontaktirati server. Provjerite svoju internet vezu.";
        } else {
          // Nešto se dogodilo pri postavljanju zahtjeva
          errorMessage.value = "Došlo je do neočekivane greške pri slanju podataka.";
        }
      } finally {
        isLoading.value = false;
      }
    };

    return {
      imeKorisnika,
      OIB,
      email,
      lozinka,
      registerUser,
      errorMessage,
      successMessage,
      isLoading
    };
  }
};
</script>

<style scoped>
/* Stilizacija forme i inputa */
.q-card {
  max-width: 400px;
  margin: 20px auto; /* Dodan gornji i donji margin za bolji razmak */
}

.q-input {
  width: 100%;
}

/* Gumb za registraciju je već full-width */
/* .q-btn {
  width: 100%;
  max-width: 400px;
} */

.q-banner {
  margin-top: 20px;
}

.text-center {
  text-align: center;
}

/* Nema potrebe za ovima ako koristite q-pa-md na q-card */
/* .q-card-section {
  padding: 20px;
}

.q-pa-md {
  padding: 30px;
} */

.full-width {
  width: 100%;
}
</style>