<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-input
        v-model="searchQuery"
        label="Unesite Ime ili Specijalnost trenera"
        outlined
        clearable
      />

      <div class="q-my-md">
        <q-checkbox v-model="searchByName" label="Pretraži po imenu" />
        <q-checkbox v-model="searchBySpeciality" label="Pretraži po specijalnosti" />
      </div>

      <q-btn label="Traži" color="primary" @click="performSearch" />

      <q-table
        v-if="filteredTreners.length"
        :rows="filteredTreners"
        :columns="columns"
        row-key="id"
        title="Rezultati Pretraživanja"
        class="q-mt-md"
      />
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const searchQuery = ref('');
    const searchByName = ref(true);
    const searchBySpeciality = ref(false);

    const columns = [
      { name: 'id', label: 'ID', align: 'left', field: row => row.id },
      { name: 'ime', label: 'Ime', align: 'left', field: row => row.ime },
      { name: 'specijalnost', label: 'Specijalnost', align: 'left', field: row => row.speciality },
      { name: 'experience', label: 'Experience', align: 'left', field: row => row.experience },
    ];

    const treners = [
      { id: 1, ime: 'Marko Horvat', speciality: 'Kardio', experience: '5 godina.' },
      { id: 2, ime: 'Ana Novak', speciality: 'Yoga', experience: '3 godine.' },
      { id: 3, ime: 'Ivan Kovačić', speciality: 'Snaga i kondicija', experience: '7 godina.' },
      { id: 4, ime: 'Lucija Matić', speciality: 'Pilates', experience: '4 godine.' }
    ];

    const filteredTreners = ref([]);

    const performSearch = () => {
      if (!searchQuery.value) {
        filteredTreners.value = [];
        return;
      }
      filteredTreners.value = treners.filter(trener => {
        const matchesName = searchByName.value && trener.ime.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesSpeciality = searchBySpeciality.value && trener.speciality.toLowerCase().includes(searchQuery.value.toLowerCase());
        return matchesName || matchesSpeciality;
      });
    };

    return {
      searchQuery,
      searchByName,
      searchBySpeciality,
      columns,
      treners,
      filteredTreners,
      performSearch
    };
  }
};
</script>