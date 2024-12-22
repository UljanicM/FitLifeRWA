<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-input
        outlined
        v-model="inputText"
        label="Pretrazi trenera"
        @input="updateDisplayedText"
      />
      <div class="q-mt-md">Treneri: {{ displayedText }}</div>

      <q-table
        :rows="trainers"
        :columns="columns"
        row-key="id"
        :pagination="pagination"
      />
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

const columns = [
  {
    name: 'ime',
    label: 'Ime',
    align: 'left',
    field: row => row.ime,
    sortable: true
  },
  {
    name: 'prezime',
    label: 'Prezime',
    align: 'left',
    field: row => row.prezime,
    sortable: true
  },
  {
    name: 'specialnost',
    label: 'Specijalnost',
    align: 'left',
    field: row => row.specialnost,
    sortable: true
  },
  {
    name: 'telefon',
    label: 'Telefon',
    align: 'center',
    field: 'telefon',
    sortable: true
  }
];

const trainers = ref([]);
const pagination = ref({
  page: 1,
  rowsPerPage: 10
});

export default {
  setup() {
    const inputText = ref('');
    const displayedText = ref('');

    const updateDisplayedText = () => {
      displayedText.value = inputText.value;
    };

    const loadTrainers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/treneri/');
        trainers.value = response.data;
      } catch (error) {
        console.error('Error loading trainers:', error);
      }
    };

    loadTrainers();

    return {
      columns,
      trainers,
      pagination,
      inputText,
      displayedText,
      updateDisplayedText
    };
  }
};
</script>

<style scoped>
.q-pa-md {
  padding: 20px;
}
</style>
