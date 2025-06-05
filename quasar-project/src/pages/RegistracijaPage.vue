<template>
  <q-page padding>
    <q-card class="q-pa-md" bordered>
      <q-card-section>
        <div class="text-h6 text-center q-mb-md">Registracija</div>

        <q-input
          v-model="imeKorisnika"
          label="Ime"
          data-cy="registracija-ime-input"
          filled
          class="q-mb-md"
          :dense="true"
          :rules="[val => (val && val.length > 0) || 'Ime je obavezno.']"
        />

        <q-input
          v-model="prezimeKorisnika"
          label="Prezime"
          data-cy="registracija-prezime-input"
          filled
          class="q-mb-md"
          :dense="true"
          :rules="[val => (val && val.length > 0) || 'Prezime je obavezno.']"
        />

        <q-input
          v-model="OIB"
          label="OIB"
          data-cy="registracija-oib-input"
          filled
          class="q-mb-md"
          :dense="true"
          :rules="[
            val => (val && val.length > 0) || 'OIB je obavezan.',
            val => /^\d{11}$/.test(val) || 'OIB mora imati točno 11 znamenki.'
          ]"
        />

        <q-input
          v-model="email"
          label="Email"
          type="email"
          data-cy="registracija-email-input"
          filled
          class="q-mb-md"
          :dense="true"
          :rules="[
            val => (val && val.length > 0) || 'Email je obavezan.',
            val => /.+@.+\..+/.test(val) || 'Unesite ispravan email format.'
          ]"
        />

        <q-input
          v-model="lozinka"
          label="Lozinka"
          type="password"
          data-cy="registracija-lozinka-input"
          filled
          class="q-mb-md"
          :dense="true"
          :rules="[
            val => (val && val.length >= 8) || 'Lozinka mora imati najmanje 8 znakova.',
            val => /[A-Z]/.test(val) || 'Lozinka mora sadržavati barem jedno veliko slovo.',
            val => /[a-z]/.test(val) || 'Lozinka mora sadržavati barem jedno malo slovo.',
            val => /[0-9]/.test(val) || 'Lozinka mora sadržavati barem jedan broj.'
          ]"
        />

        <q-input
          v-model="potvrdaLozinke"
          label="Potvrdite lozinku"
          type="password"
          data-cy="registracija-potvrda-lozinke-input"
          filled
          class="q-mb-md"
          :dense="true"
          :rules="[
            val => (val && val === lozinka) || 'Lozinke se ne podudaraju.'
          ]"
        />

        <q-btn
          @click="registerUser"
          label="Registriraj se"
          color="primary"
          class="full-width q-mt-md"
          data-cy="registracija-submit-btn"
          :loading="isLoading"
        />

      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

export default {
  name: "RegistracijaPage",
  setup() {
    const $q = useQuasar();
    const router = useRouter();

    const imeKorisnika = ref("");
    const prezimeKorisnika = ref("");
    const OIB = ref("");
    const email = ref("");
    const lozinka = ref("");
    const potvrdaLozinke = ref("");
    const isLoading = ref(false);

    const registerUser = async () => {
      isLoading.value = true;

      // Validacija na klijentskoj strani (već postoji u pravilima q-inputa, ali dupla provjera ne škodi)
      if (
        !imeKorisnika.value ||
        !prezimeKorisnika.value ||
        !OIB.value ||
        !email.value ||
        !lozinka.value ||
        !potvrdaLozinke.value
      ) {
        $q.notify({
          type: 'negative',
          message: 'Sva polja su obavezna.',
          position: 'top'
        });
        isLoading.value = false;
        return;
      }

      if (lozinka.value !== potvrdaLozinke.value) {
        $q.notify({
          type: 'negative',
          message: 'Lozinke se ne podudaraju.',
          position: 'top'
        });
        isLoading.value = false;
        return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(lozinka.value)) {
        $q.notify({
          type: 'negative',
          message: 'Lozinka mora imati najmanje 8 znakova, jedno veliko, jedno malo slovo i jedan broj.',
          position: 'top'
        });
        isLoading.value = false;
        return;
      }
      // Kraj validacije

      try {
        const userData = {
          oib: OIB.value,
          name: imeKorisnika.value,
          prezime: prezimeKorisnika.value,
          email: email.value,
          password: lozinka.value
        };

        // Preporuka: Koristi instancu axiosa definiranu u boot datoteci ako je imaš (npr. api.post)
        const response = await axios.post("http://localhost:3000/api/registracija", userData);
        console.log("Korisnik registriran:", response.data);

        $q.notify({
          type: 'positive',
          message: 'Registracija uspješna! Sada se možete prijaviti.',
          position: 'top'
        });

        // Resetiraj polja
        imeKorisnika.value = "";
        prezimeKorisnika.value = "";
        OIB.value = "";
        email.value = "";
        lozinka.value = "";
        potvrdaLozinke.value = "";

        router.push('/loginpage');
      } catch (error) {
        console.error("Greška pri registraciji:", error);
        let message = "Došlo je do neočekivane greške pri slanju podataka.";

        if (error.response && error.response.data) {
          // Ako backend vrati string kao poruku (što tvoj radi za neke greške)
          if (typeof error.response.data === 'string') {
            message = error.response.data;
          } else if (error.response.data.message) { // Ako backend vrati objekt s 'message' propertyjem
            message = error.response.data.message;
          }
        } else if (error.request) {
          message = "Nije moguće kontaktirati server. Provjerite svoju internet vezu.";
        }

        $q.notify({
          type: 'negative',
          message: message,
          position: 'top'
        });
      } finally {
        isLoading.value = false;
      }
    };

    return {
      imeKorisnika,
      prezimeKorisnika,
      OIB,
      email,
      lozinka,
      potvrdaLozinke,
      registerUser,
      isLoading
    };
  }
};
</script>

<style scoped>
.q-card {
  max-width: 400px;
  margin: 20px auto;
}

.q-input {
  width: 100%;
}

.text-center {
  text-align: center;
}

.full-width {
  width: 100%;
}
</style>
