<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Pretraživanje -->
      <q-input
        v-model="searchQuery"
        label="Unesite naziv ili kategoriju vježbe"
        outlined
        clearable
        class="q-my-md"
      />

      <!-- Tablica sa filtriranim vježbama -->
      <q-table
        v-if="filteredExercises.length"
        :rows="filteredExercises"
        :columns="columns"
        row-key="id"
        :pagination="pagination"
        class="q-mt-md"
      />
      
      <!-- Poruka ako nema rezultata -->
      <div v-else class="q-my-md text-center text-red">
        Nema rezultata za traženi pojam.
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const searchQuery = ref(''); // Tekst za pretragu
    const searchByName = ref(true); // Pretraga po imenu
    const searchByCategory = ref(true); // Pretraga po kategoriji
    const pagination = ref({
      page: 1,
      rowsPerPage: 50,
    });

    // Definicija stupaca za tablicu
    const columns = [
      { name: 'id', label: 'ID', align: 'left', field: (row) => row.id },
      { name: 'name', label: 'Naziv', align: 'left', field: (row) => row.name },
      { name: 'category', label: 'Kategorija', align: 'left', field: (row) => row.category },
      { name: 'difficulty', label: 'Težina', align: 'left', field: (row) => row.difficulty },
    ];

    const exercises = ref([]); // Svi podaci o vježbama

    // Filtrirane vježbe
    const filteredExercises = computed(() => {
      if (!searchQuery.value) return exercises.value; // Ako nema unosa, vrati sve vježbe

      const query = searchQuery.value.toLowerCase();

      return exercises.value.filter((exercise) => {
        if (searchByName.value && exercise.name.toLowerCase().includes(query)) {
          return true;
        }
        if (searchByCategory.value && exercise.category.toLowerCase().includes(query)) {
          return true;
        }
        return false;
      });
    });

    // Funkcija za dohvat podataka
    const fetchExercises = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/vjezbe');
        exercises.value = response.data;
      } catch (error) {
        console.error('Greška prilikom dohvaćanja vježbi:', error);
      }
    };

    // Učitaj vježbe prilikom inicijalizacije
    onMounted(fetchExercises);

    return {
      searchQuery,
      searchByName,
      searchByCategory,
      columns,
      exercises,
      filteredExercises,
      pagination,
    };
  },
};
</script>

<style scoped>
.error {
  color: red;
}
</style>
