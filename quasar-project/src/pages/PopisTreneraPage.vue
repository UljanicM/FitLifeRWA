<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h5 q-mb-md">Popis Trenera</div>
          <q-input
            v-model="searchTerm"
            label="Pretraži po imenu, prezimenu ili stručnosti"
            outlined
            clearable
            dense
            @update:model-value="filterTrainers"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <q-list bordered separator v-if="filteredTrainers.length > 0">
        <q-item v-for="trener in filteredTrainers" :key="trener.oib_trenera" clickable v-ripple>
          <q-item-section avatar>
            <q-avatar color="blue" text-color="white" icon="person" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-h6">{{ trener.ime }} {{ trener.prezime }}</q-item-label>
            <q-item-label caption>Stručnost: {{ trener.strucnost }}</q-item-label>
            <q-item-label caption v-if="trener.telefon">Telefon: {{ trener.telefon }}</q-item-label>
            <q-item-label caption v-if="trener.email">Email: {{ trener.email }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-card v-else-if="!loading" flat bordered class="q-mt-md">
        <q-card-section class="text-center text-grey-7">
          Nema pronađenih trenera.
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="blue" />
        <p class="q-mt-md">Učitavanje trenera...</p>
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from 'boot/axios'; // Promijenjeno: import axios from 'axios' u import { api } from 'boot/axios'
import { useQuasar } from 'quasar';

const $q = useQuasar();

const trainers = ref([]);
const searchTerm = ref('');
const loading = ref(true);

const filteredTrainers = computed(() => {
  if (!searchTerm.value) {
    return trainers.value;
  }
  const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
  return trainers.value.filter(trener =>
    (trener.ime && trener.ime.toLowerCase().includes(lowerCaseSearchTerm)) ||
    (trener.prezime && trener.prezime.toLowerCase().includes(lowerCaseSearchTerm)) ||
    (trener.strucnost && trener.strucnost.toLowerCase().includes(lowerCaseSearchTerm))
  );
});

const fetchTrainers = async () => {
  loading.value = true;
  try {
    // Promijenjeno: axios.get na api.get i uklonjen baseURL
    const response = await api.get('/treneri');
    trainers.value = response.data || [];
  } catch (error) {
    console.error('Greška pri dohvaćanju trenera:', error);
    // Interceptor će već rukovati 401/403 greškama
    if (error.response && error.response.status !== 401 && error.response.status !== 403) {
      $q.notify({
        type: 'negative',
        message: 'Greška pri učitavanju liste trenera.',
        position: 'top'
      });
    }
  } finally {
    loading.value = false;
  }
};

const filterTrainers = () => {
  // Filtriranje se događa automatski putem computed property 'filteredTrainers'
};

onMounted(() => {
  fetchTrainers();
});
</script>

<style scoped>
.my-card {
  max-width: 700px;
  margin: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>
