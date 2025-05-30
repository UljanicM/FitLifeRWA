<template>
  <q-page padding class="flex flex-center">
    <div class="q-pa-md q-gutter-md" style="max-width: 600px; width: 100%;">
      <q-card class="trainer-profile-card" flat bordered>
        <q-card-section class="bg-secondary text-white text-center">
          <q-avatar size="100px" font-size="52px" color="white" text-color="secondary" icon="sports_gymnastics" />
          <div class="text-h6 q-mt-sm">Profil Trenera</div>
        </q-card-section>

        <q-card-section v-if="trainer">
          <q-list separator>
            <q-item>
              <q-item-section avatar>
                <q-icon name="person" color="grey-7" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Ime</q-item-label>
                <q-item-label class="text-subtitle1">{{ trainer.ime_trenera || 'Nije navedeno' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="person" color="grey-7" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Prezime</q-item-label>
                <q-item-label class="text-subtitle1">{{ trainer.prezime_trenera || 'Nije navedeno' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="trainer.email_trenera">
              <q-item-section avatar>
                <q-icon name="email" color="grey-7" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Email</q-item-label>
                <q-item-label class="text-subtitle1">{{ trainer.email_trenera }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="trainer.tel_broj_trenera">
              <q-item-section avatar>
                <q-icon name="phone" color="grey-7" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Telefon</q-item-label>
                <q-item-label class="text-subtitle1">{{ trainer.tel_broj_trenera }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="trainer.strucnost">
              <q-item-section avatar>
                <q-icon name="star" color="grey-7" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Stručnost</q-item-label>
                <q-item-label class="text-subtitle1">{{ trainer.strucnost }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-section v-else class="text-center">
          <q-spinner color="secondary" size="3em" :thickness="2" />
          <p class="q-mt-md">Učitavanje podataka o treneru...</p>
        </q-card-section>
      </q-card>

      </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
// axios više nije potreban ovdje za unos plana, ali može biti potreban za dohvaćanje podataka trenera
// import axios from 'axios'; 

const router = useRouter();
const $q = useQuasar();

const trainer = ref(null);

const redirectToLogin = () => {
  router.push({ name: 'loginpage' });
};

onMounted(() => {
  const storedTrainerData = localStorage.getItem('trainer');

  if (storedTrainerData) {
    try {
      const parsedData = JSON.parse(storedTrainerData);
      trainer.value = parsedData;
    } catch (error) {
      console.error('Greška pri parsiranju podataka o treneru iz localStorage:', error);
      localStorage.removeItem('trainer');
      $q.notify({ type: 'negative', message: 'Podaci o treneru su neispravni. Molimo prijavite se ponovno.' });
      redirectToLogin();
    }
  } else {
    console.warn('Nema spremljenih podataka o treneru. Trener možda nije prijavljen.');
    redirectToLogin();
  }
});

// Uklonjena submitPlan funkcija i newPlan ref
</script>

<style scoped>
.trainer-profile-card {
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
}
.q-item__section--avatar {
  min-width: 40px;
}
.text-subtitle1 {
  font-weight: 500;
}
</style>
