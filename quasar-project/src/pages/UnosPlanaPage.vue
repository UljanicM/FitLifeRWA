<template>
  <q-page padding class="flex flex-center">
    <div class="q-pa-md q-gutter-md" style="max-width: 600px; width: 100%;">
      <q-card flat bordered>
        <q-card-section class="bg-primary text-white text-center">
          <div class="text-h6">Unos Novog Plana</div>
          <p class="q-mt-sm">Unesite detalje za novi fitness plan.</p>
        </q-card-section>
        <q-card-section>
          <q-form @submit="submitPlan" class="q-gutter-md">
            <q-input
              v-model="newPlan.naziv_plana"
              label="Naziv plana"
              outlined
              dense
              :rules="[val => !!val || 'Naziv plana je obavezan']"
            />
            <q-input
              v-model.number="newPlan.cijena_plana"
              label="Cijena plana (€)"
              outlined
              dense
              type="number"
              step="0.01"
              :rules="[val => (val !== null && val !== undefined) || 'Cijena je obavezna', val => val >= 0 || 'Cijena mora biti pozitivna']"
            />
            <q-input
              v-model.number="newPlan.trajanje_plana"
              label="Trajanje plana (dana)"
              outlined
              dense
              type="number"
              :rules="[val => (val !== null && val !== undefined) || 'Trajanje je obavezno', val => val > 0 || 'Trajanje mora biti veće od 0']"
            />
            <q-input
              v-model="newPlan.prehrana"
              label="Prehrana (opis)"
              outlined
              dense
              :rules="[val => !!val || 'Opis prehrane je obavezan']"
            />
            <q-input
              v-model="newPlan.kategorija_plana"
              label="Kategorija plana"
              outlined
              dense
              :rules="[val => !!val || 'Kategorija plana je obavezan']"
            />
            <q-btn
              label="Dodaj Plan"
              type="submit"
              color="primary"
              class="full-width"
              :loading="loadingPlanSubmit"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';

const $q = useQuasar();

const newPlan = ref({
  naziv_plana: '',
  cijena_plana: null,
  trajanje_plana: null,
  prehrana: '',
  kategorija_plana: ''
});
const loadingPlanSubmit = ref(false);

const submitPlan = async () => {
  loadingPlanSubmit.value = true;
  try {
    const response = await axios.post('http://localhost:3000/api/planovi', newPlan.value);
    $q.notify({
      type: 'positive',
      message: response.data.message || 'Plan uspješno dodan!',
      position: 'top'
    });
    // Resetiraj formu nakon uspješnog unosa
    newPlan.value = {
      naziv_plana: '',
      cijena_plana: null,
      trajanje_plana: null,
      prehrana: '',
      kategorija_plana: ''
    };
  } catch (error) {
    console.error('Greška pri dodavanju plana:', error);
    $q.notify({
      type: 'negative',
      message: error.response && error.response.data && error.response.data.message
                 ? error.response.data.message
                 : 'Došlo je do greške pri dodavanju plana.',
      position: 'top'
    });
  } finally {
    loadingPlanSubmit.value = false;
  }
};
</script>

<style scoped>
/* Stilovi za ovu stranicu */
.q-card {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>
