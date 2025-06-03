<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Pretraživanje -->
      <q-input
        v-model="searchQuery"
        label="Unesite naziv ili kategoriju vježbe"
        outlined
        clearable
        @update:model-value="performSearch"
      />

      <div class="q-my-md">
        <q-checkbox v-model="searchByName" label="Pretraži po imenu" />
        <q-checkbox v-model="searchByCategory" label="Pretraži po kategoriji" />
      </div>

      <q-btn label="Traži" color="primary" @click="performSearch" />

      <!-- Tablica sa filtriranim vježbama -->
      <q-table
        v-if="filteredExercises.length"
        :rows="filteredExercises"
        :columns="columns"
        row-key="id_vjezbe"
        title="Rezultati Pretraživanja"
        class="q-mt-md"
        :loading="loading"
        no-data-label="Nema pronađenih vježbi."
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>

      <q-card v-else-if="!loading && !filteredExercises.length && searchQuery" flat bordered class="q-mt-md">
        <q-card-section class="text-center text-grey-7">
          Nema rezultata za "{{ searchQuery }}".
        </q-card-section>
      </q-card>

      <q-card v-else-if="!loading && !filteredExercises.length" flat bordered class="q-mt-md">
        <q-card-section class="text-center text-grey-7">
          Nema dostupnih vježbi.
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
        <p class="q-mt-md">Učitavanje vježbi...</p>
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from 'boot/axios'; // Uvezi 'api' instancu
import { useQuasar } from 'quasar';

const $q = useQuasar();

const searchQuery = ref('');
const searchByName = ref(true);
const searchByCategory = ref(false); // Promijenjeno iz searchBySpeciality
const loading = ref(true); // Indikator učitavanja

const exercises = ref([]); // Svi dohvaćeni podaci o vježbama
const filteredExercises = ref([]); // Filtrirani podaci koji se prikazuju u tablici

const columns = [
  { name: 'naziv_vjezbe', label: 'Naziv Vježbe', align: 'left', field: 'naziv_vjezbe', sortable: true },
  { name: 'kategorija_vjezbe', label: 'Kategorija', align: 'left', field: 'kategorija_vjezbe', sortable: true },
  { name: 'opis_vjezbe', label: 'Opis', align: 'left', field: 'opis_vjezbe' },
];

// Funkcija za dohvaćanje vježbi s backenda
const fetchExercises = async () => {
  loading.value = true;
  try {
    // Koristi 'api' instancu i ukloni baseURL
    const response = await api.get('/vjezbe'); // Pretpostavljamo da postoji /api/vjezbe endpoint
    exercises.value = response.data || [];
    performSearch(); // Inicijalno filtriranje svih vježbi
  } catch (error) {
    console.error('Greška pri dohvaćanju vježbi:', error);
    // Interceptor će već rukovati 401/403 greškama
    if (error.response && error.response.status !== 401 && error.response.status !== 403) {
      $q.notify({
        type: 'negative',
        message: 'Greška pri učitavanju liste vježbi.',
        position: 'top'
      });
    }
  } finally {
    loading.value = false;
  }
};

// Funkcija za pretraživanje/filtriranje vježbi
const performSearch = () => {
  if (!searchQuery.value && !searchByName.value && !searchByCategory.value) {
    // Ako nema upita i nijedan checkbox nije označen, prikaži sve vježbe
    filteredExercises.value = exercises.value;
    return;
  }

  const lowerCaseQuery = searchQuery.value.toLowerCase();

  filteredExercises.value = exercises.value.filter(exercise => {
    const matchesName = searchByName.value && exercise.naziv_vjezbe && exercise.naziv_vjezbe.toLowerCase().includes(lowerCaseQuery);
    const matchesCategory = searchByCategory.value && exercise.kategorija_vjezbe && exercise.kategorija_vjezbe.toLowerCase().includes(lowerCaseQuery);

    // Ako su oba checkboxa označena, mora se podudarati s barem jednim
    // Ako je samo jedan označen, mora se podudarati s tim
    if (searchByName.value && searchByCategory.value) {
      return matchesName || matchesCategory;
    } else if (searchByName.value) {
      return matchesName;
    } else if (searchByCategory.value) {
      return matchesCategory;
    } else {
      // Ako nijedan checkbox nije označen, a postoji upit, ne bi trebalo ništa prikazati
      return false;
    }
  });
};

// Pozivanje dohvaćanja vježbi prilikom montiranja komponente
onMounted(() => {
  fetchExercises();
});
</script>

<style scoped>
/* Dodajte stilove po potrebi */
.q-table__title {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
