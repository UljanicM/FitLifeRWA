<template>
  <q-page class="q-pa-md">
    <div class="q-pa-lg">
      <h4 class="text-center">Pitaj ChatGPT  </h4>
      <!-- Polje za unos pitanja -->
      <q-input
        v-model="userQuestion"
        label="Unesite svoje pitanje"
        filled
        cclass="text-h2 text-center"
        @keyup.enter="postQuestion"
      />

      <!-- Gumb za slanje -->
      <q-btn
        label="Pošalji"
        color="primary"
        class="q-mb-md text-align-right"
        @click="postQuestion"
      />

      <!-- Prikaz odgovora -->
      <div v-if="response" class="q-mt-lg">
        <h4 class="text-center">Odgovor:</h4>
        <q-card class="q-pa-md bg-grey-2">
          <q-card-section>
            {{ response }}
          </q-card-section>
        </q-card>
      </div>

      <!-- Prikaz grešaka -->
      <div v-if="error" class="q-mt-lg text-negative">
        <q-icon name="warning" class="q-mr-sm" />
        {{ error }}
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from "vue";
import axios from "axios";

export default {
  name: "PitajPage",
  setup() {
    const userQuestion = ref(""); // Pitanje korisnika
    const response = ref(""); // Odgovor iz API-ja
    const error = ref(null); // Greška

    const postQuestion = async () => {
      if (!userQuestion.value) {
        error.value = "Molimo unesite pitanje prije slanja.";
        return;
      }

      try {
        error.value = null; // Reset grešaka
        response.value = ""; // Reset odgovora

        const res = await axios.post("http://localhost:3000/api/chat", {
          message: userQuestion.value,
        });

        response.value = res.data.content; // Postavljanje odgovora
      } catch (err) {
        console.error(err);
        error.value = "Dogodila se greška prilikom povezivanja s API-jem.";
      }
    };

    return {
      userQuestion,
      response,
      error,
      postQuestion,
    };
  },
};
</script>

<style scoped>
.text-negative {
  color: red;
  font-weight: bold;
}
</style>
