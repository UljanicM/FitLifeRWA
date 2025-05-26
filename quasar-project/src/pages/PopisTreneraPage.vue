<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h5 q-mb-md">Popis Trenera</div>
          <q-input
            v-model="searchTerm"
            label="Pretraži po imenu, prezimenu, stručnosti ili emailu"
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
            <q-avatar color="accent" text-color="white" icon="fitness_center" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ trener.ime }} {{ trener.prezime }}</q-item-label>
            <q-item-label caption>Stručnost: {{ trener.strucnost }}</q-item-label>
            <q-item-label caption v-if="trener.email">Email: {{ trener.email }}</q-item-label>
            <q-item-label caption v-if="trener.telefon">Telefon: {{ trener.telefon }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn flat round icon="info" @click="viewTrainerDetails(trener)" />
          </q-item-section>
        </q-item>
      </q-list>

      <q-card v-else-if="!loading" flat bordered class="q-mt-md">
        <q-card-section class="text-center text-grey-7">
          Nema pronađenih trenera.
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="accent" />
        <p class="q-mt-md">Učitavanje trenera...</p>
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const trainers = ref([]); // Svi treneri
const searchTerm = ref(''); // Term za pretraživanje
const loading = ref(true); // Indikator učitavanja

// Filtrirani treneri na temelju searchTerma
const filteredTrainers = computed(() => {
  if (!searchTerm.value) {
    return trainers.value;
  }
  const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
  return trainers.value.filter(trener =>
    (trener.ime && trener.ime.toLowerCase().includes(lowerCaseSearchTerm)) ||
    (trener.prezime && trener.prezime.toLowerCase().includes(lowerCaseSearchTerm)) ||
    (trener.strucnost && trener.strucnost.toLowerCase().includes(lowerCaseSearchTerm)) ||
    (trener.email && trener.email.toLowerCase().includes(lowerCaseSearchTerm)) // Dodano pretraživanje po emailu
  );
});

// Funkcija za dohvaćanje trenera s backenda
const fetchTrainers = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://localhost:3000/api/treneri');
    trainers.value = response.data || []; // API vraća direktno niz trenera
    $q.notify({
      type: 'positive',
      message: 'Treneri uspješno učitani!',
      position: 'top'
    });
  } catch (error) {
    console.error('Greška pri dohvaćanju trenera:', error);
    $q.notify({
      type: 'negative',
      message: 'Greška pri učitavanju liste trenera.',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

// Funkcija za filtriranje (poziva se pri svakoj promjeni searchTerma)
const filterTrainers = () => {
  // Filtriranje se događa automatski putem computed property 'filteredTrainers'
  // Ovdje možete dodati dodatnu logiku ako je potrebno, npr. debounce
};

// Funkcija za pregled detalja trenera (možete je proširiti)
const viewTrainerDetails = (trener) => {
  $q.notify({
    type: 'info',
    message: `Prikaz detalja za trenera ${trener.ime} ${trener.prezime} (funkcionalnost u razvoju)`,
    position: 'top'
  });
  // Ovdje možete preusmjeriti na zasebnu stranicu s detaljima trenera
  // router.push(`/treneri/${trener.oib_trenera}`);
};

onMounted(() => {
  fetchTrainers();
});
</script>

<style scoped>
.q-list {
  max-width: 600px;
  margin: auto;
}
.q-card {
  max-width: 600px;
  margin: auto;
}
</style>
