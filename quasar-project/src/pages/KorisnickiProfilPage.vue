<template>
  <q-page padding>
    <div class="q-pa-md q-gutter-md">
      <q-card v-if="clan" class="my-card">
        <q-card-section>
          <div class="text-h6">Vaš profil</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="clan.ime_clana"
                label="Ime"
                outlined
                dense
                :readonly="!editMode"
                :rules="[val => !!val || 'Ime je obavezno']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="clan.prezime_clana"
                label="Prezime"
                outlined
                dense
                :readonly="!editMode"
                :rules="[val => !!val || 'Prezime je obavezno']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="clan.email_clana"
                label="Email"
                outlined
                dense
                type="email"
                :readonly="!editMode"
                :rules="[val => !!val || 'Email je obavezan', val => /.+@.+\..+/.test(val) || 'Unesite ispravan email']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="clan.tel_broj_clana"
                label="Telefon"
                outlined
                dense
                :readonly="!editMode"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="clan.kilaza"
                label="Kilaza (kg)"
                outlined
                dense
                type="number"
                :readonly="!editMode"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="clan.kategorija"
                label="Kategorija"
                outlined
                dense
                :readonly="!editMode"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-if="!editMode" label="Uredi Profil" color="primary" @click="editMode = true" />
          <q-btn v-if="editMode" label="Spremi Promjene" color="positive" @click="saveProfile" />
          <q-btn v-if="editMode" label="Odustani" color="negative" @click="cancelEdit" />
        </q-card-actions>
      </q-card>

      <q-card v-if="aktivniPlan" class="my-card q-mt-md">
        <q-card-section>
          <div class="text-h6">Vaš aktivni plan</div>
        </q-card-section>
        <q-card-section>
          <q-list dense bordered class="rounded-borders">
            <q-item>
              <q-item-section>
                <q-item-label caption>Naziv plana:</q-item-label>
                <q-item-label>{{ aktivniPlan.naziv_plana }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Datum početka:</q-item-label>
                <q-item-label>{{ formatDate(aktivniPlan.datum_pocetka_plana) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Datum isteka:</q-item-label>
                <q-item-label>{{ formatDate(aktivniPlan.datum_isteka_plana) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card v-if="aktivniPlan && aktivniPlan.ime_trenera" class="my-card q-mt-md">
        <q-card-section>
          <div class="text-h6">Dodijeljeni Trener</div>
        </q-card-section>
        <q-card-section>
          <q-list dense bordered class="rounded-borders">
            <q-item>
              <q-item-section>
                <q-item-label caption>Ime trenera:</q-item-label>
                <q-item-label>{{ aktivniPlan.ime_trenera }} {{ aktivniPlan.prezime_trenera }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Stručnost:</q-item-label>
                <q-item-label>{{ aktivniPlan.strucnost }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Email trenera:</q-item-label>
                <q-item-label>{{ aktivniPlan.email_trenera }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Telefon trenera:</q-item-label>
                <q-item-label>{{ aktivniPlan.tel_broj_trenera }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card v-if="!aktivniPlan && !loadingActivePlan" class="my-card q-mt-md">
        <q-card-section class="text-center text-grey-7">
          <q-icon name="info" size="xl" class="q-mb-md" />
          <div class="text-subtitle1">Trenutno nemate aktivan plan.</div>
          <q-btn label="Odaberite plan" color="primary" class="q-mt-md" to="/popisplanova" />
        </q-card-section>
      </q-card>

      <q-card class="my-card q-mt-md">
        <q-card-section>
          <div class="text-h6">Prati Napredak</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="addProgress" class="q-gutter-md">
            <q-input
              v-model.number="novaTezina"
              label="Trenutna težina (kg)"
              outlined
              dense
              type="number"
              step="0.1"
              :rules="[val => val !== null && val !== '' || 'Težina je obavezna', val => val > 0 || 'Težina mora biti veća od 0']"
            />
            <q-select
              v-model="novaKategorija"
              label="Kategorija"
              outlined
              dense
              :options="['Početnik', 'Rekreativac', 'Srednji', 'Napredan', 'Profesionalac']"
              emit-value
              map-options
            />
            <q-input
              v-model="selectedDate"
              label="Datum unosa"
              outlined
              dense
              type="date"
              :rules="[val => !!val || 'Datum je obavezan']"
            />
            <q-input
              v-model.number="novaDuzinaIzvedbePlana"
              label="Dužina izvedbe plana (dana)"
              outlined
              dense
              type="number"
              :rules="[val => val === null || val === '' || val >= 0 || 'Dužina mora biti pozitivan broj ili prazno']"
            />
            <q-btn type="submit" label="Dodaj Napredak" color="primary" :loading="loadingAddProgress" />
          </q-form>
        </q-card-section>

        <q-separator class="q-my-md" />

        <q-card-section v-if="povijestNapretka.length > 0">
          <div class="text-h6 q-mb-md">Povijest Napretka</div>
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
          Nema unosa napretka.
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="loadingProfile || loadingActivePlan || loadingProgressHistory">
        <q-spinner-gears size="50px" color="teal" />
        <p class="q-mt-md">Učitavanje podataka...</p>
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();

const clan = ref(null);
const originalClan = ref(null);
const editMode = ref(false);
const loadingProfile = ref(true);
const aktivniPlan = ref(null);
const loadingActivePlan = ref(true);

// Stanja za praćenje napretka
const novaTezina = ref(null);
const novaKategorija = ref(null);
const selectedDate = ref(new Date().toISOString().slice(0, 10)); // Postavi današnji datum
const novaDuzinaIzvedbePlana = ref(null);
const loadingAddProgress = ref(false);
const povijestNapretka = ref([]);
const loadingProgressHistory = ref(true);

const fetchClanData = async () => {
  loadingProfile.value = true;
  const storedClan = localStorage.getItem('clan');
  if (storedClan) {
    const parsedClan = JSON.parse(storedClan);
    if (parsedClan.oib_clana) {
      try {
        const response = await axios.get(`http://localhost:3000/api/clan/${parsedClan.oib_clana}`);
        clan.value = { ...response.data.clan };
        originalClan.value = { ...response.data.clan };
        $q.notify({
          type: 'positive',
          message: 'Podaci profila uspješno učitani!',
          position: 'top'
        });
      } catch (error) {
        console.error('Greška pri dohvaćanju podataka člana:', error);
        $q.notify({
          type: 'negative',
          message: 'Greška pri učitavanju podataka profila.',
          position: 'top'
        });
        if (error.response && error.response.status === 404) {
          localStorage.removeItem('clan');
          router.push('/loginpage');
        }
      } finally {
        loadingProfile.value = false;
      }
    } else {
      $q.notify({
        type: 'negative',
        message: 'OIB člana nije pronađen u lokalnoj pohrani. Molimo prijavite se ponovo.',
        position: 'top'
      });
      localStorage.removeItem('clan');
      router.push('/loginpage');
      loadingProfile.value = false;
    }
  } else {
    $q.notify({
      type: 'negative',
      message: 'Niste prijavljeni. Molimo prijavite se.',
      position: 'top'
    });
    router.push('/loginpage');
    loadingProfile.value = false;
  }
};

const fetchAktivniPlan = async (oib_clana) => {
  loadingActivePlan.value = true;
  try {
    const response = await axios.get(`http://localhost:3000/api/clanovi/${oib_clana}/aktivni-plan`);
    aktivniPlan.value = response.data.aktivniPlan;
    $q.notify({
      type: 'positive',
      message: 'Aktivni plan uspješno učitan!',
      position: 'top'
    });
  } catch (error) {
    console.error('Greška pri dohvaćanju aktivnog plana:', error);
    aktivniPlan.value = null;
    if (error.response && error.response.status === 404) {
        $q.notify({
            type: 'info',
            message: 'Nemate aktivan plan.',
            position: 'top'
        });
    } else {
        $q.notify({
            type: 'negative',
            message: 'Greška pri učitavanju aktivnog plana.',
            position: 'top'
        });
    }
  } finally {
    loadingActivePlan.value = false;
  }
};

// NOVA FUNKCIJA: Dohvaćanje povijesti napretka
const fetchProgressHistory = async (oib_clana) => {
  loadingProgressHistory.value = true;
  try {
    const response = await axios.get(`http://localhost:3000/api/clanovi/${oib_clana}/napredak`);
    povijestNapretka.value = response.data.povijestNapretka;
    $q.notify({
      type: 'positive',
      message: 'Povijest napretka učitana!',
      position: 'top'
    });
  } catch (error) {
    console.error('Greška pri dohvaćanju povijesti napretka:', error);
    povijestNapretka.value = []; // Postavi na prazan niz ako nema podataka
    if (error.response && error.response.status === 404) {
        $q.notify({
            type: 'info',
            message: 'Nema unosa napretka za prikaz.',
            position: 'top'
        });
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

// NOVA FUNKCIJA: Dodavanje novog unosa napretka
const addProgress = async () => {
  loadingAddProgress.value = true;
  const oib_clana = clan.value?.oib_clana;

  if (!oib_clana) {
    $q.notify({ type: 'negative', message: 'Nije moguće identificirati OIB člana.', position: 'top' });
    loadingAddProgress.value = false;
    return;
  }
  if (novaTezina.value === null || novaTezina.value === '' || novaTezina.value <= 0) {
    $q.notify({ type: 'negative', message: 'Molimo unesite ispravnu težinu.', position: 'top' });
    loadingAddProgress.value = false;
    return;
  }
  if (!selectedDate.value) {
    $q.notify({ type: 'negative', message: 'Molimo odaberite datum unosa.', position: 'top' });
    loadingAddProgress.value = false;
    return;
  }

  try {
    const response = await axios.post('http://localhost:3000/api/napredak', {
      oib_clana: oib_clana,
      datum_unosa: selectedDate.value,
      tezina: novaTezina.value,
      duzina_izvedbe_plana: novaDuzinaIzvedbePlana.value,
      kategorija_clana: novaKategorija.value
    });

    $q.notify({
      type: 'positive',
      message: response.data.message || 'Napredak uspješno dodan!',
      position: 'top'
    });

    // Osvježi povijest napretka nakon uspješnog dodavanja
    await fetchProgressHistory(oib_clana);

    // Resetiraj formu za unos
    novaTezina.value = null;
    novaKategorija.value = null;
    selectedDate.value = new Date().toISOString().slice(0, 10); // Postavi današnji datum
    novaDuzinaIzvedbePlana.value = null;

  } catch (error) {
    console.error('Greška pri dodavanju napretka:', error);
    $q.notify({
      type: 'negative',
      message: error.response && error.response.data && error.response.data.message
                 ? error.response.data.message
                 : 'Došlo je do greške pri dodavanju napretka.',
      position: 'top'
    });
  } finally {
    loadingAddProgress.value = false;
  }
};

const saveProfile = async () => {
  if (clan.value && !/.+@.+\..+/.test(clan.value.email_clana)) {
    $q.notify({
      type: 'negative',
      message: 'Molimo unesite ispravan format email adrese.',
      position: 'top'
    });
    return;
  }
  
  if (!clan.value.ime_clana || !clan.value.prezime_clana || !clan.value.email_clana) {
    $q.notify({
      type: 'negative',
      message: 'Ime, prezime i email su obavezni.',
      position: 'top'
    });
    return;
  }

  try {
    const response = await axios.put(`http://localhost:3000/api/clan/${clan.value.oib_clana}`, clan.value);
    clan.value = { ...response.data.clan };
    originalClan.value = { ...response.data.clan };
    localStorage.setItem('clan', JSON.stringify(clan.value));
    editMode.value = false;
    $q.notify({
      type: 'positive',
      message: response.data.message,
      position: 'top'
    });
  } catch (error) {
    console.error('Greška pri spremanju profila:', error);
    $q.notify({
      type: 'negative',
      message: error.response && error.response.data && error.response.data.message
                 ? error.response.data.message
                 : 'Greška pri spremanju promjena profila.',
      position: 'top'
    });
  }
};

const cancelEdit = () => {
  clan.value = { ...originalClan.value };
  editMode.value = false;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('hr-HR', options);
};

onMounted(async () => {
  await fetchClanData();
  if (clan.value && clan.value.oib_clana) {
    await fetchAktivniPlan(clan.value.oib_clana);
    await fetchProgressHistory(clan.value.oib_clana); // Dohvati povijest napretka pri učitavanju
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
