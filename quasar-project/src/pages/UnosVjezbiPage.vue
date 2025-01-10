<template>
  <q-page class="q-pa-md flex justify-center items-center">
    <div class="form-container">
      <h1 class="text-center">Unos Vježbe</h1>
      <p class="text-center">Unesite podatke vježbe za registraciju.</p>

      <!-- Naziv vježbe -->
      <q-input
        v-model="exercise.name"
        label="Naziv vježbe"
        :rules="[val => val && val.length > 0 || 'Naziv vježbe je obavezan']"
        lazy-rules
        class="q-mb-md"
      />

      <!-- Kategorija vježbe -->
      <q-input
        v-model="exercise.category"
        label="Kategorija vježbe"
        :rules="[val => val && val.length > 0 || 'Kategorija vježbe je obavezna']"
        lazy-rules
        class="q-mb-md"
      />

      <!-- Težina vježbe (ručni unos) -->
      <q-input
        v-model="exercise.difficulty"
        label="Težina vježbe"
        :rules="[val => val && val.length > 0 || 'Težina vježbe je obavezna']"
        lazy-rules
        class="q-mb-md"
      />

      <!-- Gumb za unos -->
      <q-btn label="Unesi vježbu" color="primary" @click="submitForm" class="full-width-btn" />

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
    const exercise = ref({
      name: '',
      category: '',
      difficulty: ''
    });

    const message = ref(null);

    const submitForm = async () => {
      if (exercise.value.name && exercise.value.category && exercise.value.difficulty) {
        try {
          // Samo šaljemo vrijednost 'difficulty', a ne cijeli objekt
          const response = await axios.post('http://localhost:3000/api/vjezbe', {
            name: exercise.value.name,
            category: exercise.value.category,
            difficulty: exercise.value.difficulty // Poslati samo vrijednost
          });
          message.value = { type: 'positive', text: 'Vježba uspješno unesena!' };
          // Resetiraj formu
          exercise.value = { name: '', category: '', difficulty: '' };
        } catch (error) {
          message.value = { type: 'negative', text: 'Došlo je do greške pri unosu vježbe.' };
        }
      } else {
        message.value = { type: 'negative', text: 'Molimo popunite sve obavezne podatke.' };
      }
    };

    return { exercise, message, submitForm };
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

/* Razmak između selecta */
.q-select {
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
