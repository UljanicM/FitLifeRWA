<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h5 q-mb-md">Odaberite svoj plan</div>
          <q-input
            v-model="searchTerm"
            label="Pretraži planove po nazivu, trajanju, cijeni, prehrani ili kategoriji"
            outlined
            clearable
            dense
            @update:model-value="filterPlans"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <q-list bordered separator v-if="filteredPlans.length > 0">
        <q-item v-for="plan in filteredPlans" :key="plan.id">
          <q-item-section avatar>
            <q-avatar color="red" text-color="white" icon="fitness_center" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-h6">{{ plan.naziv_plana }}</q-item-label>
            <q-item-label caption>Trajanje: {{ plan.trajanje_plana }} dana</q-item-label>
            <q-item-label caption>Cijena: {{ plan.cijena_plana }} €</q-item-label>
            <q-item-label caption v-if="plan.prehrana">Prehrana: {{ plan.prehrana }}</q-item-label>
            <q-item-label caption v-if="plan.kategorija_plana">Kategorija: {{ plan.kategorija_plana }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn
              label="Odaberi Plan"
              color="primary"
              @click="openSelectTrainerDialog(plan)"
              :disable="!isLoggedIn"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <q-card v-else-if="!loading" flat bordered class="q-mt-md">
        <q-card-section class="text-center text-grey-7">
          Nema pronađenih planova.
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="red" />
        <p class="q-mt-md">Učitavanje planova...</p>
      </q-inner-loading>
    </div>

    <q-dialog v-model="selectTrainerDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Odaberite trenera za plan "{{ selectedPlan?.naziv_plana }}"</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="selectedTrainerOIB"
            :options="trainerOptions"
            label="Odaberite trenera"
            emit-value
            map-options
            outlined
            dense
            :rules="[val => !!val || 'Trener je obavezan']"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Odustani" @click="selectTrainerDialog = false" />
          <q-btn flat label="Potvrdi Odabir" @click="confirmPlanSelection" :loading="loadingSelection" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();

const plans = ref([]);
const searchTerm = ref('');
const loading = ref(true);
const isLoggedIn = ref(false);

const selectTrainerDialog = ref(false);
const selectedPlan = ref(null);
const trainers = ref([]);
const selectedTrainerOIB = ref(null);
const loadingSelection = ref(false);

const checkLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('clan');
};

const trainerOptions = computed(() => {
  return trainers.value.map(trainer => ({
    label: `${trainer.ime} ${trainer.prezime} (${trainer.strucnost})`,
    value: trainer.oib_trenera
  }));
});

const filteredPlans = computed(() => {
  if (!searchTerm.value) {
    return plans.value;
  }
  const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
  return plans.value.filter(plan =>
    (plan.naziv_plana && plan.naziv_plana.toLowerCase().includes(lowerCaseSearchTerm)) ||
    (plan.trajanje_plana && String(plan.trajanje_plana).includes(lowerCaseSearchTerm)) ||
    (plan.cijena_plana && String(plan.cijena_plana).includes(lowerCaseSearchTerm)) ||
    (plan.prehrana && plan.prehrana.toLowerCase().includes(lowerCaseSearchTerm)) ||
    (plan.kategorija_plana && plan.kategorija_plana.toLowerCase().includes(lowerCaseSearchTerm))
  );
});

const fetchPlans = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://localhost:3000/api/planovi');
    plans.value = response.data || [];
    // $q.notify({ // Uklonjeno: Notifikacija za uspješno učitavanje
    //   type: 'positive',
    //   message: 'Planovi uspješno učitani!',
    //   position: 'top'
    // });
  } catch (error) {
    console.error('Greška pri dohvaćanju planova:', error);
    $q.notify({
      type: 'negative',
      message: 'Greška pri učitavanju liste planova.',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const fetchTrainers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/treneri');
    trainers.value = response.data || [];
  } catch (error) {
    console.error('Greška pri dohvaćanju trenera:', error);
    $q.notify({
      type: 'negative',
      message: 'Greška pri učitavanju liste trenera.',
      position: 'top'
    });
  }
};

const filterPlans = () => {
  // Filtriranje se događa automatski putem computed property 'filteredPlans'
};

const openSelectTrainerDialog = (plan) => {
  if (!isLoggedIn.value) {
    $q.notify({
      type: 'warning',
      message: 'Morate biti prijavljeni da biste odabrali plan.',
      position: 'top'
    });
    router.push('/loginpage');
    return;
  }
  selectedPlan.value = plan;
  selectedTrainerOIB.value = null;
  selectTrainerDialog.value = true;
};

const confirmPlanSelection = async () => {
  if (!selectedTrainerOIB.value) {
    $q.notify({
      type: 'negative',
      message: 'Molimo odaberite trenera.',
      position: 'top'
    });
    return;
  }

  loadingSelection.value = true;
  const storedClan = localStorage.getItem('clan');
  if (!storedClan) {
    $q.notify({
      type: 'negative',
      message: 'Nema podataka o prijavljenom članu.',
      position: 'top'
    });
    router.push('/loginpage');
    loadingSelection.value = false;
    return;
  }

  try {
    const clanData = JSON.parse(storedClan);
    const oib_clana = clanData.oib_clana;

    const payload = {
      oib_clana: oib_clana,
      naziv_plana: selectedPlan.value.naziv_plana,
      oib_trenera: selectedTrainerOIB.value
    };

    const response = await axios.post('http://localhost:3000/api/clanovi/odabir-plana', payload);

    $q.notify({
      type: 'positive',
      message: response.data.message || 'Plan uspješno odabran i dodijeljen trener!',
      position: 'top'
    });

    selectTrainerDialog.value = false;
    router.push('/profil');

  } catch (error) {
    console.error('Greška pri odabiru plana:', error);
    $q.notify({
      type: 'negative',
      message: error.response && error.response.data && error.response.data.message
                 ? error.response.data.message
                 : 'Došlo je do greške pri odabiru plana.',
      position: 'top'
    });
  } finally {
    loadingSelection.value = false;
  }
};

onMounted(async () => {
  checkLoginStatus();
  await fetchPlans();
  await fetchTrainers();
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
