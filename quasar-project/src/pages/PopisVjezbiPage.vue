<template>
  <div class="popis-vjezbi-page">
    <q-table
      :rows="exercises"
      :columns="columns"
      row-key="id"
      :pagination="pagination"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Definicija kolona za prikaz vježbi
const columns = [
  {
    name: 'id',
    label: 'ID',
    align: 'left',
    field: row => row.id,
    sortable: true
  },
  {
    name: 'name',
    label: 'Naziv vježbe',
    align: 'left',
    field: row => row.name,
    sortable: true
  },
  {
    name: 'category',
    label: 'Kategorija',
    align: 'left',
    field: row => row.category,
    sortable: true
  },
  {
    name: 'difficulty',
    label: 'Težina',
    align: 'left',
    field: row => row.difficulty,
    sortable: true
  }
];

// Podaci o vježbama
const exercises = ref([
  { id: 1, name: "Čučnjevi", category: "Snaga", difficulty: "Srednje" },
  { id: 2, name: "Sklekovi", category: "Snaga", difficulty: "Lako" },
  { id: 3, name: "Trbušnjaci", category: "Kardio", difficulty: "Srednje" },
  { id: 4, name: "Plank", category: "Snaga", difficulty: "Teško" },
  { id: 5, name: "Iskorak", category: "Snaga", difficulty: "Srednje" }
]);

// Paginacija
const pagination = ref({
  page: 1,
  rowsPerPage: 5
});
</script>

<style scoped>
.popis-vjezbi-page {
  padding: 20px;
}
</style>