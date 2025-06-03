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
        <q-item v-for="plan in filteredPlans" :key="plan.id_plana">
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
            <!-- Gumb "Odaberi Plan" prikazuje se samo ako korisnik NIJE admin i PRIJAVLJEN je -->
            <q-btn
              v-if="!isAdmin && isLoggedIn"
              label="Odaberi Plan"
              color="primary"
              @click="openSelectTrainerDialog(plan)"
              :disable="loadingSelection"
            />
            <!-- Opcionalno, možete prikazati poruku za admine -->
            <q-item-label v-else-if="isAdmin" caption class="text-grey-6">
              Admin ne može odabrati plan.
            </q-item-label>
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

    <!-- DIJALOG ZA ODABIR TRENERA -->
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
import { api } from 'boot/axios';
import { useQuasar, LocalStorage } from 'quasar';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();

const plans = ref([]);
const searchTerm = ref('');
const loading = ref(true);
const isLoggedIn = ref(false); 
const isAdmin = ref(false); // NOVO: Dodana varijabla za provjeru admin uloge

// Stanja za dijalog odabira trenera
const selectTrainerDialog = ref(false);
const selectedPlan = ref(null);
const trainers = ref([]); 
const selectedTrainerOIB = ref(null); 
const loadingSelection = ref(false); 

// Provjerava status prijave korisnika i ulogu
const checkLoginStatusAndRole = () => {
  const storedClan = LocalStorage.getItem('clan');
  const storedTrainer = LocalStorage.getItem('trainer');

  if (storedClan) {
    isLoggedIn.value = true;
    // Provjeri ulogu za člana
    if (storedClan.role === 'admin') { // Provjera uloge
      isAdmin.value = true;
    } else {
      isAdmin.value = false;
    }
  } else if (storedTrainer) {
    isLoggedIn.value = true;
    // Treneri također ne bi trebali odabirati planove za sebe na ovoj stranici,
    // već im je namijenjena administracija ili dodjeljivanje planova drugim članovima.
    // Stoga ih tretiramo slično kao admine u smislu odabira plana.
    isAdmin.value = true; // Trenerima također onemogućujemo odabir plana
  } else {
    isLoggedIn.value = false;
    isAdmin.value = false;
  }
};

// Computed property za opcije trenera u q-selectu
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
    const response = await api.get('/planovi');
    plans.value = response.data || [];
  } catch (error) {
    console.error('Greška pri dohvaćanju planova:', error);
    if (error.response && error.response.status !== 401 && error.response.status !== 403) {
      $q.notify({
        type: 'negative',
        message: 'Greška pri učitavanju liste planova.',
        position: 'top'
      });
    }
  } finally {
    loading.value = false;
  }
};

// Nova funkcija za dohvaćanje trenera
const fetchTrainers = async () => {
  try {
    const response = await api.get('/treneri');
    trainers.value = response.data || [];
  } catch (error) {
    console.error('Greška pri dohvaćanju trenera:', error);
    if (error.response && error.response.status !== 401 && error.response.status !== 403) {
      $q.notify({
        type: 'negative',
        message: 'Greška pri učitavanju liste trenera.',
        position: 'top'
      });
    }
  }
};

const filterPlans = () => {
  // Filtriranje se događa automatski putem computed property 'filteredPlans'
};

// Otvara dijalog za odabir trenera
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
  // Dodatna provjera: Ako je korisnik admin, spriječite otvaranje dijaloga
  if (isAdmin.value) {
    $q.notify({
      type: 'warning',
      message: 'Administratori ne mogu odabrati plan na ovoj stranici.',
      position: 'top'
    });
    return;
  }

  selectedPlan.value = plan;
  selectedTrainerOIB.value = null; 
  selectTrainerDialog.value = true;
};

// Potvrđuje odabir plana i trenera
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
  const storedClan = LocalStorage.getItem('clan'); 

  if (!storedClan || !storedClan.oib_clana) {
    $q.notify({
      type: 'negative',
      message: 'Nije moguće pronaći OIB člana. Molimo prijavite se ponovo.',
      position: 'top'
    });
    router.push('/loginpage');
    loadingSelection.value = false;
    return;
  }

  try {
    const payload = {
      oib_clana: storedClan.oib_clana,
      naziv_plana: selectedPlan.value.naziv_plana,
      oib_trenera: selectedTrainerOIB.value 
    };

    const response = await api.post('/clanovi/odabir-plana', payload);

    $q.notify({
      type: 'positive',
      message: response.data.message || 'Plan uspješno odabran i dodijeljen trener!',
      position: 'top'
    });

    selectTrainerDialog.value = false; 
    router.push('/profil'); 

  } catch (error) {
    console.error('Greška pri odabiru plana:', error);
    if (error.response && error.response.status !== 401 && error.response.status !== 403) {
      $q.notify({
        type: 'negative',
        message: error.response && error.response.data && error.response.data.message
                        ? error.response.data.message
                        : 'Došlo je do greške pri odabiru plana.',
        position: 'top'
      });
    }
  } finally {
    loadingSelection.value = false;
  }
};

onMounted(async () => {
  checkLoginStatusAndRole(); // Provjeri status prijave i ulogu pri montiranju
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
