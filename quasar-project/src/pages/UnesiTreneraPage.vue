<template>
  <q-page class="q-pa-md flex justify-center items-center">
    <div class="form-container">
      <h1 class="text-center">Unos Trenera</h1>
      <p class="text-center">Unesite podatke trenera za registraciju.</p>

      <!-- Ime trenera -->
      <q-input
        v-model="trainer.ime_trenera"
        label="Ime trenera"
        :rules="[val => val && val.length > 0 || 'Ime trenera je obavezno']"
        lazy-rules
        class="q-mb-md"
      />

      <!-- Prezime trenera -->
      <q-input
        v-model="trainer.prezime_trenera"
        label="Prezime trenera"
        :rules="[val => val && val.length > 0 || 'Prezime trenera je obavezno']"
        lazy-rules
        class="q-mb-md"
      />

      <!-- OIB trenera -->
      <q-input
        v-model="trainer.oib_trenera"
        label="OIB trenera"
        :rules="[val => val && val.length > 0 || 'OIB trenera je obavezan']"
        lazy-rules
        class="q-mb-md"
      />

      <!-- Adresa trenera -->
      <q-input
        v-model="trainer.adresa_trenera"
        label="Adresa trenera"
        :rules="[val => val && val.length > 0 || 'Adresa trenera je obavezna']"
        lazy-rules
        class="q-mb-md"
      />

      <!-- Telefon trenera -->
      <q-input
        v-model="trainer.tel_broj_trenera"
        label="Telefon trenera"
        :rules="[val => val && val.length > 0 || 'Telefon trenera je obavezan']"
        lazy-rules
        class="q-mb-md"
      />

      <!-- Specijalnost trenera -->
      <q-input
        v-model="trainer.specialnost"
        label="Specijalnost"
        :rules="[val => val && val.length > 0 || 'Specijalnost trenera je obavezna']"
        lazy-rules
        class="q-mb-md"
      />

      <!-- Gumb za unos -->
      <q-btn label="Unesi trenera" color="primary" @click="submitForm" class="full-width-btn" />

      <!-- Poruka o uspjehu -->
      <div v-if="message" class="text-center mt-4" :class="message.type === 'positive' ? 'text-green-500' : 'text-red-500'">
        {{ message.text }}
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const trainer = ref({
      ime_trenera: '',
      prezime_trenera: '',
      oib_trenera: '',
      adresa_trenera: '',
      tel_broj_trenera: '',
      specialnost: ''
    });

    const message = ref(null);

    const submitForm = async () => {
      if (trainer.value.ime_trenera && trainer.value.prezime_trenera && trainer.value.oib_trenera) {
        try {
          const response = await axios.post('http://localhost:3000/api/trainers', trainer.value);
          message.value = { type: 'positive', text: 'Trener uspješno unesen!' };
          // Resetiraj formu
          trainer.value = { ime_trenera: '', prezime_trenera: '', oib_trenera: '', adresa_trenera: '', tel_broj_trenera: '', specialnost: '' };
        } catch (error) {
          message.value = { type: 'negative', text: 'Došlo je do greške pri unosu trenera.' };
        }
      } else {
        message.value = { type: 'negative', text: 'Molimo popunite sve obavezne podatke.' };
      }
    };

    return { trainer, message, submitForm };
  }
};
</script>

<style scoped>
/* Kontejner za formu centriran na ekranu */
.form-container {
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

/* Naslov */
h1 {
  font-size: 2.5rem;
  color: #422c50;
  margin-bottom: 15px;
  font-weight: bold;
}

/* Podnaslov */
p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 30px;
}

/* Stil za gumb */
.q-btn {
  width: 100%;
  margin-top: 20px;
  border-radius: 10px;
  padding: 12px 0;
}

/* Poboljšanje za hover efekt na gumbu */
.q-btn:hover {
  background-color: #6619d2;
  transform: scale(1.05);
  transition: transform 0.3s ease, background-color 0.3s ease;
}

/* Razmak između inputa */
.q-input {
  width: 100%;
}

/* Dodatni razmak između svakog inputa */
.q-mb-md {
  margin-bottom: 20px;
}

/* Stil za poruku o uspjehu/grešci */
.text-green-500 {
  color: #38a169;
}

.text-red-500 {
  color: #e53e3e;
}
</style>
