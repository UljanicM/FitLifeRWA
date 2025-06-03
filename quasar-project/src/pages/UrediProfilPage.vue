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
import { useQuasar, LocalStorage } from 'quasar'; 
import { api } from 'boot/axios'; 

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

const kategorijaOptions = ref([
  'Početnik',
  'Rekreativac',
  'Srednja razina',
  'Napredna razina',
  'Profesionalac'
]);

const fetchClanData = async (oib) => {
  try {
    const response = await api.get(`/clan/${oib}`);
    const clanData = response.data.clan;
    editedClan.value.oib_clana = clanData.oib_clana || '';
    editedClan.value.ime_clana = clanData.ime_clana || '';
    editedClan.value.prezime_clana = clanData.prezime_clana || '';
    editedClan.value.email_clana = clanData.email_clana || '';
    editedClan.value.tel_broj_clana = clanData.tel_broj_clana || '';
    editedClan.value.kilaza = clanData.kilaza !== null ? parseFloat(clanData.kilaza) : null;
    editedClan.value.kategorija = clanData.kategorija || '';
  } catch (error) {
    console.error('Greška pri dohvaćanju podataka člana:', error);
    if (error.response && error.response.status !== 401 && error.response.status !== 403) {
      $q.notify({
        type: 'negative',
        message: 'Greška pri učitavanju profila.',
        position: 'top'
      });
    }
  }
};

const updateProfile = async () => {
  try {
    const oib = editedClan.value.oib_clana;
    if (!oib) {
      $q.notify({ type: 'negative', message: 'OIB člana nije dostupan za ažuriranje.', position: 'top' });
      return;
    }

    const dataToSend = {
      ime_clana: editedClan.value.ime_clana,
      prezime_clana: editedClan.value.prezime_clana,
      email_clana: editedClan.value.email_clana,
      tel_broj_clana: editedClan.value.tel_broj_clana,
      kilaza: editedClan.value.kilaza,
      kategorija: editedClan.value.kategorija
    };

    const response = await api.put(`/clan/${oib}`, dataToSend);

    // LocalStorage.getItem() automatski parsira objekte
    const storedClan = LocalStorage.getItem('clan'); 
    if (storedClan) {
      // Provjera da li se ažurirani član podudara s onim u LocalStorageu
      // LocalStorage.set() automatski stringificira objekte
      if (storedClan.oib_clana === response.data.clan.oib_clana) {
        LocalStorage.set('clan', response.data.clan);
        // Emitiranje globalnog događaja za ažuriranje u MainLayoutu (ako je potrebno)
        window.dispatchEvent(new Event('auth-change'));
      }
    }

    $q.notify({
      type: 'positive',
      message: 'Profil uspješno ažuriran!',
      position: 'top'
    });
    router.push('/profil');
  } catch (error) {
    console.error('Greška pri ažuriranju profila:', error);
    if (error.response && error.response.status !== 401 && error.response.status !== 403) {
      $q.notify({
        type: 'negative',
        message: error.response && error.response.data && error.response.data.message
                        ? error.response.data.message
                        : 'Došlo je do greške pri ažuriranju profila.',
        position: 'top'
      });
    }
  }
};

const cancelEdit = () => {
  router.push('/profil');
};

onMounted(() => {
  // LocalStorage.getItem() automatski parsira objekte
  const storedClan = LocalStorage.getItem('clan'); 
  if (storedClan) {
    try {
      // storedClan je već JavaScript objekt, nema potrebe za JSON.parse()
      if (storedClan.oib_clana) {
        fetchClanData(storedClan.oib_clana);
      } else {
        $q.notify({ type: 'negative', message: 'OIB člana nije pronađen u lokalnoj pohrani.', position: 'top' });
        router.push('/');
      }
    } catch (e) {
      console.error("Failed to process clan data from LocalStorage", e); // Promijenjen opis greške
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
