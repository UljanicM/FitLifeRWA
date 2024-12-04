<template>
  <q-page padding>
    <!-- Registracija Form -->
    <q-card class="q-pa-md" bordered>
      <q-card-section>
        <div class="text-h6 text-center q-mb-md">Registracija</div>

        <!-- Ime -->
        <q-input
          v-model="firstName"
          label="Ime"
          filled
          class="q-mb-md"
          :dense="true"
        />

        <!-- Prezime -->
        <q-input
          v-model="lastName"
          label="Prezime"
          filled
          class="q-mb-md"
          :dense="true"
        />

        <!-- Korisničko ime -->
        <q-input
          v-model="username"
          label="Korisničko ime"
          filled
          class="q-mb-md"
          :dense="true"
        />

        <!-- Lozinka -->
        <q-input
          v-model="password"
          label="Lozinka"
          type="password"
          filled
          class="q-mb-md"
          :dense="true"
        />

        <!-- Potvrda lozinke -->
        <q-input
          v-model="confirmPassword"
          label="Potvrdi lozinku"
          type="password"
          filled
          class="q-mb-md"
          :dense="true"
        />

        <!-- Gumb za registraciju -->
        <q-btn
          @click="registerUser"
          label="Registriraj se"
          color="primary"
          class="full-width q-mt-md"
        />

        <!-- Prikazivanje greške -->
        <q-banner v-if="errorMessage" class="q-mt-md" color="negative" dense>
          {{ errorMessage }}
        </q-banner>

        <!-- Poruka uspjeha -->
        <q-banner v-if="successMessage" class="q-mt-md" color="positive" dense>
          {{ successMessage }}
        </q-banner>

      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from "vue";

export default {
  name: "RegistracijaPage",
  setup() {
    // Reaktivni objekti za unos korisničkih podataka
    const firstName = ref("");
    const lastName = ref("");
    const username = ref("");
    const password = ref("");
    const confirmPassword = ref("");

    // Poruke o grešci i uspjehu
    const errorMessage = ref("");
    const successMessage = ref("");

    // Funkcija za registraciju korisnika
    const registerUser = () => {
      // Resetiranje poruka
      errorMessage.value = "";
      successMessage.value = "";

      // Provjera da li su uneseni svi podaci
      if (!firstName.value || !lastName.value || !username.value || !password.value || !confirmPassword.value) {
        errorMessage.value = "Molimo unesite ime, prezime, korisničko ime, lozinku i potvrdu lozinke.";
        return;
      }

      // Provjera da li se lozinka i potvrda lozinke poklapaju
      if (password.value !== confirmPassword.value) {
        errorMessage.value = "Lozinke nisu iste.";
        return;
      }

      // Simulacija registracije korisnika (u stvarnom slučaju, trebate poslati podatke na backend)
      console.log("Korisnik registriran:", { firstName: firstName.value, lastName: lastName.value, username: username.value, password: password.value });

      // Ako registracija bude uspješna, postavljanje uspješne poruke
      successMessage.value = "Registracija uspješna! Sada se možete prijaviti.";

      // Resetiranje unosa
      firstName.value = "";
      lastName.value = "";
      username.value = "";
      password.value = "";
      confirmPassword.value = "";
    };

    return {
      firstName,
      lastName,
      username,
      password,
      confirmPassword,
      registerUser,
      errorMessage,
      successMessage
    };
  }
};
</script>

<style scoped>
/* Stilizacija forme i inputa */
.q-card {
  max-width: 400px;
  margin: 0 auto;
}

.q-input {
  width: 100%;
}

.q-btn {
  width: 100%;
  max-width: 400px;
}

.q-banner {
  margin-top: 20px;
}

.text-center {
  text-align: center;
}

.q-card-section {
  padding: 20px;
}

.q-pa-md {
  padding: 30px;
}

.full-width {
  width: 100%;
}
</style>