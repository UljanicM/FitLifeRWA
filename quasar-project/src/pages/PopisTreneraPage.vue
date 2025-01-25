<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Input za pretragu -->
      <q-input
        v-model="searchQuery"
        label="Unesite naziv ili specijalnost trenera"
        outlined
        clearable
        class="q-my-md"
      />

      <q-table
        :rows="filteredTrainers"
        :columns="columns"
        row-key="id"
        :pagination="pagination"
        class="q-mt-md"
      />
    </div>
  </q-page>
</template>

<script>
import { ref, computed } from "vue";
import axios from "axios";

export default {
  setup() {
    const searchQuery = ref(""); // Tekst za pretragu
    const searchByName = ref(true); // Pretraži po imenu
    const searchByCategory = ref(true); // Pretraži po specijalnosti
    const trainers = ref([]); // Svi treneri
    const pagination = ref({
      page: 1,
      rowsPerPage: 50,
    });

    const columns = [
      { name: "ime", label: "Ime", align: "left", field: (row) => row.ime, sortable: true },
      { name: "prezime", label: "Prezime", align: "left", field: (row) => row.prezime, sortable: true },
      { name: "specialnost", label: "Specijalnost", align: "left", field: (row) => row.specialnost, sortable: true },
      { name: "telefon", label: "Telefon", align: "center", field: "telefon", sortable: true },
    ];

    // Funkcija za učitavanje trenera
    const loadTrainers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/treneri/");
        trainers.value = response.data;
      } catch (error) {
        console.error("Greška pri učitavanju trenera:", error);
      }
    };

    // Filtrirani treneri na temelju pretrage
    const filteredTrainers = computed(() => {
      if (!searchQuery.value) return trainers.value;

      return trainers.value.filter((trainer) => {
        const query = searchQuery.value.toLowerCase();
        if (searchByName.value && trainer.ime.toLowerCase().includes(query)) {
          return true;
        }
        if (searchByName.value && trainer.prezime.toLowerCase().includes(query)) {
          return true;
        }
        if (searchByCategory.value && trainer.specialnost.toLowerCase().includes(query)) {
          return true;
        }
        return false;
      });
    });

    
    loadTrainers();

    return {
      searchQuery,
      searchByName,
      searchByCategory,
      trainers,
      filteredTrainers,
      columns,
      pagination,
      
    };
  },
};
</script>

<style scoped>
.q-pa-md {
  padding: 20px;
}
</style>
