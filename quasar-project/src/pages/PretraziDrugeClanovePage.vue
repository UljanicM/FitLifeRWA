<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h5 q-mb-md">Pretraži Druge Članove</div>
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
        <q-item
          v-for="clan in filteredMembers"
          :key="clan.oib_clana"
          clickable
          v-ripple
          @click="viewMemberDetails(clan.oib_clana)"
        >
          <q-item-section avatar>
            <q-avatar color="blue-grey" text-color="white" icon="person" />
          </q-item-section>

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
        <q-spinner-gears size="50px" color="blue-grey" />
        <p class="q-mt-md">Učitavanje članova...</p>
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from 'boot/axios'; // Promijenjeno: import axios from 'axios' u import { api } from 'boot/axios'
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router'; // Uvozimo useRouter

const $q = useQuasar();
const router = useRouter(); // Inicijaliziramo useRouter

const members = ref([]);
const searchTerm = ref('');
const loading = ref(true);

const filteredMembers = computed(() => {
  if (!searchTerm.value) {
    return members.value;
  }
  const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
  return members.value.filter(member =>
    (member.ime_clana && member.ime_clana.toLowerCase().includes(lowerCaseSearchTerm)) ||
    (member.prezime_clana && member.prezime_clana.toLowerCase().includes(lowerCaseSearchTerm)) ||
    (member.kategorija && member.kategorija.toLowerCase().includes(lowerCaseSearchTerm))
  );
});

const fetchMembers = async () => {
  loading.value = true;
  try {
    // Promijenjeno: axios.get na api.get i uklonjen baseURL
    const response = await api.get('/clanovi');
    members.value = response.data.clanovi || [];
    $q.notify({
      type: 'positive',
      message: 'Članovi uspješno učitani!',
      position: 'top'
    });
  } catch (error) {
    console.error('Greška pri dohvaćanju članova:', error);
    // Interceptor će već rukovati 401/403 greškama
    if (error.response && error.response.status !== 401 && error.response.status !== 403) {
      $q.notify({
        type: 'negative',
        message: 'Greška pri učitavanju liste članova.',
        position: 'top'
      });
    }
  } finally {
    loading.value = false;
  }
};

const filterMembers = () => {
  // Filtriranje se događa automatski putem computed property 'filteredMembers'
};

// Nova funkcija za navigaciju na detalje člana
const viewMemberDetails = (oib) => {
  router.push({ name: 'detalji-clana', params: { oib: oib } });
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
