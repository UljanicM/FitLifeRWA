<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-md">
      <q-card v-if="clan" class="my-card">
        <q-card-section>
          <div class="text-h6">Profil člana: {{ clan.ime_clana }} {{ clan.prezime_clana }}</div>
        </q-card-section>

        <q-card-section>
          <q-list dense bordered class="rounded-borders">
            <q-item>
              <q-item-section>
                <q-item-label caption>Ime:</q-item-label>
                <q-item-label>{{ clan.ime_clana }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Prezime:</q-item-label>
                <q-item-label>{{ clan.prezime_clana }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Kategorija:</q-item-label>
                <q-item-label>{{ clan.kategorija || 'Nije definirano' }}</q-item-label>
              </q-item-section>
            </q-item>
            </q-list>
        </q-card-section>
      </q-card>

      <q-card class="my-card q-mt-md">
        <q-card-section>
          <div class="text-h6">Povijest Napretka</div>
        </q-card-section>
        <q-card-section v-if="povijestNapretka.length > 0">
          <q-list bordered separator>
            <q-item v-for="progress in povijestNapretka" :key="progress.datum_unosa">
              <q-item-section>
                <q-item-label>Datum: {{ formatDate(progress.datum_unosa) }}</q-item-label>
                <q-item-label caption>Težina: {{ progress.tezina }} kg</q-item-label>
                <q-item-label caption v-if="progress.duzina_izvedbe_plana !== null">
                  Dužina izvedbe plana: {{ progress.duzina_izvedbe_plana }} dana
                </q-item-label>
                <q-item-label caption v-if="progress.kategorija_clana">
                  Kategorija: {{ progress.kategorija_clana }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section v-else-if="!loadingProgressHistory" class="text-center text-grey-7">
          Nema unosa napretka za ovog člana.
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="loadingProfile || loadingProgressHistory">
        <q-spinner-gears size="50px" color="primary" />
        <p class="q-mt-md">Učitavanje podataka...</p>
      </q-inner-loading>

      <q-card v-if="!clan && !loadingProfile" class="my-card q-mt-md">
        <q-card-section class="text-center text-grey-7">
          <q-icon name="error" size="xl" class="q-mb-md" />
          <div class="text-subtitle1">Član nije pronađen.</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from 'boot/axios'; // Promijenjeno: import axios from 'axios' u import { api } from 'boot/axios'
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router'; 

const $q = useQuasar();
const route = useRoute(); 

const clan = ref(null);
const loadingProfile = ref(true);
const povijestNapretka = ref([]);
const loadingProgressHistory = ref(true);

const fetchClanData = async (oib_clana) => {
  loadingProfile.value = true;
  try {
    // Promijenjeno: axios.get na api.get i uklonjen baseURL
    const response = await api.get(`/clan/${oib_clana}`);
    clan.value = response.data.clan;
  } catch (error) {
    console.error('Greška pri dohvaćanju podataka člana:', error);
    $q.notify({
      type: 'negative',
      message: 'Greška pri učitavanju podataka profila člana.',
      position: 'top'
    });
    clan.value = null; 
  } finally {
    loadingProfile.value = false;
  }
};

const fetchProgressHistory = async (oib_clana) => {
  loadingProgressHistory.value = true;
  try {
    // Promijenjeno: axios.get na api.get i uklonjen baseURL
    const response = await api.get(`/clanovi/${oib_clana}/napredak`);
    povijestNapretka.value = response.data.povijestNapretka;
  } catch (error) {
    console.error('Greška pri dohvaćanju povijesti napretka:', error);
    povijestNapretka.value = [];
    if (error.response && error.response.status === 404) {
        // Nema povijesti napretka, to je očekivano za 404
    } else {
        $q.notify({
            type: 'negative',
            message: 'Greška pri učitavanju povijesti napretka.',
            position: 'top'
        });
    }
  } finally {
    loadingProgressHistory.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('hr-HR', options);
};

onMounted(async () => {
  const oib_clana = route.params.oib; 
  if (oib_clana) {
    await fetchClanData(oib_clana);
    await fetchProgressHistory(oib_clana);
  } else {
    $q.notify({
      type: 'negative',
      message: 'OIB člana nije pronađen u ruti.',
      position: 'top'
    });
    loadingProfile.value = false;
    loadingProgressHistory.value = false;
  }
});
</script>

<style scoped>
.my-card {
  max-width: 700px;
  margin: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.q-list.rounded-borders {
  border-radius: 8px;
}
</style>
