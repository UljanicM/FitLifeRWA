<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h5 q-mb-md">Pretraži Članove</div>
          <q-input
            v-model="searchTerm"
            label="Pretraži po imenu, prezimenu ili kategoriji"
            outlined
            clearable
            dense
            @update:model-value="filterMembers"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <q-list bordered separator v-if="filteredMembers.length > 0">
        <q-item v-for="clan in filteredMembers" :key="clan.oib_clana" clickable v-ripple>
          <q-item-section avatar>
            <q-avatar color="green" text-color="white" icon="person" /> </q-item-section>

          <q-item-section>
            <q-item-label class="text-h6">{{ clan.ime_clana }} {{ clan.prezime_clana }}</q-item-label>
            <q-item-label caption v-if="clan.kategorija">Kategorija: {{ clan.kategorija }}</q-item-label>
            </q-item-section>
        </q-item>
      </q-list>

      <q-card v-else-if="!loading" flat bordered class="q-mt-md">
        <q-card-section class="text-center text-grey-7">
          Nema pronađenih članova.
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="green" /> <p class="q-mt-md">Učitavanje članova...</p>
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar(); // Ispravljeno: use quasar() -> useQuasar()

const members = ref([]); // Svi članovi
const searchTerm = ref(''); // Term za pretraživanje
const loading = ref(true); // Indikator učitavanja

// Filtrirani članovi na temelju searchTerma
const filteredMembers = computed(() => {
  if (!searchTerm.value) {
    return members.value;
  }
  const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
  return members.value.filter(member =>
    // PROMJENA: Pretraživanje samo po imenu, prezimenu ili kategoriji
    (member.ime_clana && member.ime_clana.toLowerCase().includes(lowerCaseSearchTerm)) ||
    (member.prezime_clana && member.prezime_clana.toLowerCase().includes(lowerCaseSearchTerm)) ||
    (member.kategorija && member.kategorija.toLowerCase().includes(lowerCaseSearchTerm))
  );
});

// Funkcija za dohvaćanje članova s backenda
const fetchMembers = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://localhost:3000/api/clanovi');
    members.value = response.data.clanovi || [];
    $q.notify({
      type: 'positive',
      message: 'Članovi uspješno učitani!',
      position: 'top'
    });
  } catch (error) {
    console.error('Greška pri dohvaćanju članova:', error);
    $q.notify({
      type: 'negative',
      message: 'Greška pri učitavanju liste članova.',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

// Funkcija za filtriranje (poziva se pri svakoj promjeni searchTerma)
const filterMembers = () => {
  // Filtriranje se događa automatski putem computed property 'filteredMembers'
};

onMounted(() => {
  fetchMembers();
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
