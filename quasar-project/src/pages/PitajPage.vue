<template>
  <q-page class="q-pa-md">
    <div class="q-pa-lg">
      <h4 class="text-center">Pitaj AI</h4>
      <q-input
        v-model="userQuestion"
        label="Unesite svoje pitanje"
        filled
        class="text-center"
        @keyup.enter="postQuestion"
      />

      <div class="q-pa-lg centar">
        <q-btn
          label="Pošalji"
          color="primary"
          class="text-align-center"
          @click="postQuestion"
        />
      </div>

      <div v-if="response" class="q-mt-lg">
        <h4 class="text-center">Odgovor:</h4>
        <q-card class="q-pa-md bg-grey-2">
          <q-card-section style="max-height: 500px; overflow-y: auto; word-wrap: break-word; white-space: pre-wrap;">
            {{ response }}
          </q-card-section>
        </q-card>
      </div>

      <div v-if="error" class="q-mt-lg text-negative">
        <q-icon name="warning" class="q-mr-sm" />
        {{ error }}
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, getCurrentInstance } from "vue"; // Import getCurrentInstance
// Removed direct axios import as we will use the global $api instance
// import axios from "axios";

export default {
  name: "PitajPage",
  setup() {
    const app = getCurrentInstance(); // Get the current Vue application instance
    const $api = app.appContext.config.globalProperties.$api; // Access the global $api instance

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

        // *** CHANGE HERE: Use the global $api instance instead of direct axios ***
        const res = await $api.post("/chat", { // Base URL 'http://localhost:3000/api' is already set in axios.js
          message: userQuestion.value,
        });

        response.value = res.data.content; // Postavljanje odgovora
      } catch (err) {
        console.error("Greška pri pozivanju AI API-ja:", err.response || err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          error.value = "Nemate dozvolu ili vaša sesija je istekla. Molimo prijavite se ponovo.";
        } else {
          error.value = "Dogodila se greška prilikom povezivanja s AI API-jem.";
        }
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
.centar{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

}
</style>