<template>
  <q-page padding>
    <!-- Login Form -->
    <q-card class="q-pa-md" bordered>
      <q-card-section>
       <div class="text-h6 text-center q-mb-md">Prijava</div>
        <p class="text-center q-mb-md">Unesite korisničko ime i lozinku</p>

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

        <!-- Gumb za potvrdu -->
        <q-btn
          @click="loginUser"
          label="Potvrdi"
          color="primary"
          class="full-width q-mt-md"
        />

        <!-- Prikazivanje greške -->
        <q-banner v-if="errorMessage" class="q-mt-md" color="negative" dense>
          {{ errorMessage }}
        </q-banner>

      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from "vue";

export default {
  name: "LoginPage",
  setup() {
    // Reaktivni objekat za prijavu
    const username = ref("");
    const password = ref("");

    // Poruka o grešci (ako se prijava ne uspije)
    const errorMessage = ref("");

    // Funkcija za prijavu korisnika
    const loginUser = () => {
      // Resetiranje poruka
      errorMessage.value = "";

      // Provjera da li su uneseni korisničko ime i lozinka
      if (!username.value || !password.value) {
        errorMessage.value = "Molimo unesite korisničko ime i lozinku.";
        return;
      }

      // Simulacija prijave korisnika (u stvarnom slučaju, trebate poslati podatke na backend)
      console.log("Korisnik prijavljen:", { username: username.value, password: password.value });

      // Ako prijava bude uspješna, preusmjeriti na drugi ekran (npr. dashboard ili homepage)
      // U stvarnoj aplikaciji obično šaljete zahtjev na backend za provjeru podataka i tokena.

      // Ako je prijava uspješna, možete napraviti preusmjeravanje (na primjer):
      // this.$router.push('/dashboard');
    };

    return {
      username,
      password,
      loginUser,
      errorMessage
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