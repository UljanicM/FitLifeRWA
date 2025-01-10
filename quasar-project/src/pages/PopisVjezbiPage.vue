<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Pretraživanje -->
      <q-input
        v-model="searchQuery"
        label="Unesite naziv ili kategoriju vježbe"
        outlined
        clearable
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
        row-key="id"
        title="Rezultati Pretraživanja"
        class="q-mt-md"
      />
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const searchQuery = ref('');
    const searchByName = ref(true);
    const searchByCategory = ref(false);

    const columns = [
      { name: 'id', label: 'ID', align: 'left', field: row => row.id },
      { name: 'name', label: 'Naziv', align: 'left', field: row => row.name },
      { name: 'category', label: 'Kategorija', align: 'left', field: row => row.category },
      { name: 'difficulty', label: 'Težina', align: 'left', field: row => row.difficulty },
    ];

    const exercises = ref([]);
    const filteredExercises = ref([]);

    // Dohvati sve vježbe pri inicijalizaciji
    const fetchExercises = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/vjezbe');
        exercises.value = response.data;
        filteredExercises.value = exercises.value;
      } catch (error) {
        console.error("Greška prilikom dohvaćanja vježbi", error);
      }
    };

    onMounted(fetchExercises);

    // Pretraga
    const performSearch = () => {
      if (!searchQuery.value) {
        filteredExercises.value = exercises.value; // Ako nema pretrage, prikazuj sve
        return;
      }

      filteredExercises.value = exercises.value.filter(exercise => {
        const matchesName = searchByName.value && exercise.name.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesCategory = searchByCategory.value && exercise.category.toLowerCase().includes(searchQuery.value.toLowerCase());
        return matchesName || matchesCategory;
      });
    };

    return {
      searchQuery,
      searchByName,
      searchByCategory,
      columns,
      exercises,
      filteredExercises,
      performSearch
    };
  }
};
</script>

<style scoped>
.error {
  color: red;
}
</style>
