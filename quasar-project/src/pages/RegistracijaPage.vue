<template>
  <q-page padding>
    <!-- Registracija Form -->
    <q-card class="q-pa-md" bordered>
      <q-card-section>
        <div class="text-h6 text-center q-mb-md">Registracija</div>

        <!-- Ime -->
        <q-input
          v-model="name"
          label="Ime"
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

        <!-- Email -->
        <q-input
          v-model="email"
          label="Email"
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
import axios from "axios";
import { ref } from "vue";

export default {
  name: "RegistracijaPage",
  setup() {
    const name = ref("");
    const username = ref("");
    const email = ref("");
    const password = ref("");
    const errorMessage = ref("");
    const successMessage = ref("");

    const registerUser = async () => {
      errorMessage.value = "";
      successMessage.value = "";

      // Provjera da li su svi podaci uneseni
      if (!name.value || !username.value || !email.value || !password.value) {
        errorMessage.value = "Svi podaci su obavezni.";
        return;
      }

      try {
        const userData = {
          name: name.value,
          username: username.value,
          email: email.value,
          password: password.value
        };

        // Slanje podataka na backend (novi API endpoint)
        const response = await axios.post("http://localhost:3000/api/registracija", userData);
        console.log("Korisnik registriran:", response.data);

        successMessage.value = "Registracija uspješna! Sada se možete prijaviti.";
        // Resetiranje unosa
        name.value = "";
        username.value = "";
        email.value = "";
        password.value = "";
      } catch (error) {
        console.error("Greška pri registraciji:", error);
        errorMessage.value = "Došlo je do greške pri registraciji.";
      }
    };

    return {
      name,
      username,
      email,
      password,
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
