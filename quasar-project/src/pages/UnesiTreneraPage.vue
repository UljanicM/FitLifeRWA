<template>
  <q-page class="q-pa-md flex justify-center items-center">
    <div class="form-container">
      <h1 class="text-center">Unos Trenera</h1>
      <p class="text-center">Unesite podatke trenera za registraciju.</p>

      <q-form @submit="submitForm" class="q-gutter-md">
        <q-input
          v-model="trainer.ime_trenera"
          label="Ime trenera"
          :rules="[val => val && val.length > 0 || 'Ime trenera je obavezno']"
          lazy-rules
        />

        <q-input
          v-model="trainer.prezime_trenera"
          label="Prezime trenera"
          :rules="[val => val && val.length > 0 || 'Prezime trenera je obavezno']"
          lazy-rules
        />

        <q-input
          v-model="trainer.oib_trenera"
          label="OIB trenera"
          :rules="[val => val && val.length > 0 || 'OIB trenera je obavezan']"
          lazy-rules
        />

        <q-input
          v-model="trainer.email_trenera"
          label="Email trenera"
          type="email" :rules="[
            val => val && val.length > 0 || 'Email trenera je obavezan',
            val => /.+@.+\..+/.test(val) || 'Unesite ispravnu email adresu'
          ]"
          lazy-rules
        />

        <q-input
          v-model="trainer.tel_broj_trenera"
          label="Telefon trenera"
          :rules="[val => val && val.length > 0 || 'Telefon trenera je obavezan']"
          lazy-rules
        />

        <q-input
          v-model="trainer.specialnost"
          label="Specijalnost"
          :rules="[val => val && val.length > 0 || 'Specijalnost trenera je obavezna']"
          lazy-rules
        />

        <q-input
          v-model="trainer.lozinka_trenera"
          label="Lozinka trenera"
          type="password"
          :rules="[
            val => val && val.length > 0 || 'Lozinka trenera je obavezna',
            val => val.length >= 8 || 'Lozinka mora imati najmanje 8 znakova',
            val => /[A-Z]/.test(val) || 'Lozinka mora sadržavati barem jedno veliko slovo',
            val => /[a-z]/.test(val) || 'Lozinka mora sadržavati barem jedno malo slovo',
            val => /[0-9]/.test(val) || 'Lozinka mora sadržavati barem jedan broj'
          ]"
          lazy-rules
        />

        <q-btn label="Unesi trenera" type="submit" color="primary" class="full-width-btn" />
      </q-form>

      </div>
  </q-page>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

export default {
  setup() {
    const $q = useQuasar();

    const trainer = ref({
      ime_trenera: '',
      prezime_trenera: '',
      oib_trenera: '',
      email_trenera: '',
      tel_broj_trenera: '',
      specialnost: '',
      lozinka_trenera: '' // NOVO: Dodano polje za lozinku
    });

    const submitForm = async () => {
      // Ažurirana validacija da uključuje lozinku
      if (
        trainer.value.ime_trenera &&
        trainer.value.prezime_trenera &&
        trainer.value.oib_trenera &&
        trainer.value.email_trenera &&
        trainer.value.tel_broj_trenera &&
        trainer.value.specialnost &&
        trainer.value.lozinka_trenera // Dodana provjera za lozinku
      ) {
        try {
          const response = await axios.post('http://localhost:3000/api/trainers', trainer.value);

          $q.notify({
            type: 'positive',
            message: 'Trener uspješno unesen!',
            position: 'top'
          });
          console.log('Trener uspješno unesen:', response.data);

          // Resetiraj formu
          trainer.value = {
            ime_trenera: '',
            prezime_trenera: '',
            oib_trenera: '',
            email_trenera: '',
            tel_broj_trenera: '',
            specialnost: '',
            lozinka_trenera: ''
          };

        } catch (error) {
          console.error('Greška pri unosu trenera:', error);
          $q.notify({
            type: 'negative',
            message: error.response && error.response.data && error.response.data.message
                       ? error.response.data.message
                       : 'Došlo je do greške pri unosu trenera.',
            position: 'top'
          });
        }
      } else {
        $q.notify({
          type: 'warning',
          message: 'Molimo popunite sva obavezna polja.',
          position: 'top'
        });
      }
    };

    return { trainer, submitForm };
  }
};
</script>

<style scoped>
.form-container {
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

h1 {
  font-size: 2.5rem;
  color: #422c50;
  margin-bottom: 15px;
  font-weight: bold;
}

p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 30px;
}

.q-btn {
  width: 100%;
  margin-top: 20px;
  border-radius: 10px;
  padding: 12px 0;
}

.q-btn:hover {
  background-color: #6619d2;
  transform: scale(1.05);
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.q-input {
  width: 100%;
}

.q-mb-md {
  margin-bottom: 20px;
}
</style>
