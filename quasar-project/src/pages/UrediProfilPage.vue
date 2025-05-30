<template>
  <q-page padding class="flex flex-center">
    <q-card class="profile-edit-card" flat bordered>
      <q-card-section class="bg-primary text-white text-center">
        <div class="text-h6 q-mt-sm">Uredi Korisnički Profil</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="updateProfile" class="q-gutter-md">
          <q-input
            v-model="editedClan.oib_clana"
            label="OIB Člana"
            readonly
            filled
            disable
          />

          <q-input
            v-model="editedClan.ime_clana"
            label="Ime Člana"
            :rules="[val => val && val.length > 0 || 'Ime je obavezno']"
            lazy-rules
          />

          <q-input
            v-model="editedClan.prezime_clana"
            label="Prezime Člana"
            :rules="[val => val && val.length > 0 || 'Prezime je obavezno']"
            lazy-rules
          />

          <q-input
            v-model="editedClan.email_clana"
            label="Email Člana"
            type="email"
            :rules="[
              val => val && val.length > 0 || 'Email je obavezan',
              val => /.+@.+\..+/.test(val) || 'Unesite ispravnu email adresu'
            ]"
            lazy-rules
          />

          <q-input
            v-model="editedClan.tel_broj_clana"
            label="Telefon Člana"
            type="tel"
            :rules="[val => !val || /^\+?\d{6,15}$/.test(val) || 'Unesite ispravan telefonski broj']"
            lazy-rules
          />

          <q-input
            v-model.number="editedClan.kilaza"
            label="Kilaža (kg)"
            type="number"
            step="0.01"
            :rules="[
              val => !val || (val > 0 && val < 300) || 'Kilaža mora biti između 0 i 300 kg'
            ]"
            lazy-rules
          />

          <q-select
            v-model="editedClan.kategorija"
            label="Kategorija"
            :options="kategorijaOptions"
            emit-value
            map-options
            :rules="[val => !val || kategorijaOptions.includes(val) || 'Odaberite ispravnu kategoriju']"
            lazy-rules
          />

          <q-card-actions align="right">
            <q-btn flat label="Odustani" color="negative" @click="cancelEdit" />
            <q-btn type="submit" label="Spremi Promjene" color="primary" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const editedClan = ref({
  oib_clana: '',
  ime_clana: '',
  prezime_clana: '',
  email_clana: '',
  tel_broj_clana: '', 
  kilaza: null,       
  kategorija: ''      
});

// Opcije za kategoriju (možete ih dinamički učitavati ili prilagoditi po potrebi)
const kategorijaOptions = ref([
  'Početnik',
  'Rekreativac',
  'Srednja razina',
  'Napredna razina',
  'Profesionalac'
]);

// Funkcija za dohvaćanje podataka o članu
const fetchClanData = async (oib) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/clan/${oib}`);
    const clanData = response.data.clan;
    // Popunite editedClan s dohvaćenim podacima
    editedClan.value.oib_clana = clanData.oib_clana || '';
    editedClan.value.ime_clana = clanData.ime_clana || '';
    editedClan.value.prezime_clana = clanData.prezime_clana || '';
    editedClan.value.email_clana = clanData.email_clana || '';
    editedClan.value.tel_broj_clana = clanData.tel_broj_clana || '';
    editedClan.value.kilaza = clanData.kilaza !== null ? parseFloat(clanData.kilaza) : null;
    editedClan.value.kategorija = clanData.kategorija || '';
  } catch (error) {
    console.error('Greška pri dohvaćanju podataka člana:', error);
    $q.notify({
      type: 'negative',
      message: 'Greška pri učitavanju profila.',
      position: 'top'
    });
    router.push('/'); // Preusmjeri na početnu ako je greška
  }
};

// Funkcija za ažuriranje profila
const updateProfile = async () => {
  try {
    const oib = editedClan.value.oib_clana;
    if (!oib) {
      $q.notify({ type: 'negative', message: 'OIB člana nije dostupan za ažuriranje.', position: 'top' });
      return;
    }

    // Podaci za slanje na backend
    const dataToSend = {
      ime_clana: editedClan.value.ime_clana,
      prezime_clana: editedClan.value.prezime_clana,
      email_clana: editedClan.value.email_clana,
      tel_broj_clana: editedClan.value.tel_broj_clana,
      kilaza: editedClan.value.kilaza,
      kategorija: editedClan.value.kategorija
    };

    const response = await axios.put(`http://localhost:3000/api/clan/${oib}`, dataToSend);

    // Ažuriraj localStorage sa novim podacima člana (ako je potrebno za prikaz u layoutu)
    const storedClan = JSON.parse(localStorage.getItem('clan'));
    if (storedClan && storedClan.oib_clana === response.data.clan.oib_clana) {
      localStorage.setItem('clan', JSON.stringify(response.data.clan));
      // Emitiraj globalni događaj da se MainLayout ažurira (ako je potrebno)
      window.dispatchEvent(new Event('auth-change'));
    }

    $q.notify({
      type: 'positive',
      message: 'Profil uspješno ažuriran!',
      position: 'top'
    });
    router.push('/profil'); // Vrati se na stranicu profila
  } catch (error) {
    console.error('Greška pri ažuriranju profila:', error);
    $q.notify({
      type: 'negative',
      message: error.response && error.response.data
               ? error.response.data
               : 'Došlo je do greške pri ažuriranju profila.',
      position: 'top'
    });
  }
};

const cancelEdit = () => {
  router.push('/profil'); // Vrati se na stranicu profila bez spremanja
};

onMounted(() => {
  const storedClan = localStorage.getItem('clan');
  if (storedClan) {
    try {
      const parsedClan = JSON.parse(storedClan);
      if (parsedClan.oib_clana) {
        fetchClanData(parsedClan.oib_clana);
      } else {
        $q.notify({ type: 'negative', message: 'OIB člana nije pronađen u lokalnoj pohrani.', position: 'top' });
        router.push('/');
      }
    } catch (e) {
      console.error("Failed to parse clan data from localStorage", e);
      $q.notify({ type: 'negative', message: 'Podaci o članu su neispravni.', position: 'top' });
      router.push('/');
    }
  } else {
    $q.notify({ type: 'negative', message: 'Niste prijavljeni.', position: 'top' });
    router.push('/loginpage');
  }
});
</script>

<style scoped>
.profile-edit-card {
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
}
</style>
