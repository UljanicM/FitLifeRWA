<template>
  <q-page padding class="flex flex-center">
    <q-card class="profile-card" flat bordered>
      <q-card-section class="bg-primary text-white text-center">
        <q-avatar size="100px" font-size="52px" color="white" text-color="primary" icon="person" />
        <div class="text-h6 q-mt-sm">Korisnički Profil</div>
      </q-card-section>

      <q-card-section v-if="user">
        <q-list separator>
          <q-item>
            <q-item-section avatar>
              <q-icon name="badge" color="grey-7" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Ime</q-item-label>
              <q-item-label class="text-subtitle1">{{ user.ime_clana || 'Nije navedeno' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="badge" color="grey-7" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Prezime</q-item-label>
              <q-item-label class="text-subtitle1">{{ user.prezime_clana || 'Nije navedeno' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="user.email_clana">
            <q-item-section avatar>
              <q-icon name="email" color="grey-7" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Email</q-item-label>
              <q-item-label class="text-subtitle1">{{ user.email_clana }}</q-item-label>
            </q-item-section>
          </q-item>

        </q-list>
      </q-card-section>

      <q-card-section v-else class="text-center">
        <q-spinner color="primary" size="3em" :thickness="2" />
        <p class="q-mt-md">Učitavanje podataka o korisniku...</p>
        </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Uredi Profil" color="primary" @click="editProfile" />
        <q-btn flat label="Odjava" color="negative" @click="logout" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // Za preusmjeravanje

// Pretpostavka: koristite Vue Router
const router = useRouter();

const user = ref(null);

onMounted(() => {
  // Pokušaj dohvaćanja podataka o korisniku (npr. iz localStorage)
  // U stvarnoj aplikaciji, ovo bi moglo dolaziti iz Vuex/Pinia store-a
  // ili biste mogli napraviti API poziv ako je potrebno.
  const storedClanData = localStorage.getItem('clan');

  if (storedClanData) {
    try {
      const parsedData = JSON.parse(storedClanData);
      // Vaš backend vraća 'clan' objekt unutar 'data' objekta nakon prijave.
      // Ako direktno spremate `response.data.clan` u localStorage:
      user.value = parsedData;

      // Ako ste spremili cijeli `response.data` (koji sadrži `message` i `clan`):
      // if (parsedData && parsedData.clan) {
      //   user.value = parsedData.clan;
      // } else {
      //   console.warn('Format spremljenih podataka o korisniku nije očekivan:', parsedData);
      //   redirectToLogin();
      // }

    } catch (error) {
      console.error('Greška pri parsiranju podataka o korisniku iz localStorage:', error);
      localStorage.removeItem('clan'); // Ukloni neispravne podatke
      // Opcionalno: preusmjeri na login ako podaci nisu ispravni
      // redirectToLogin();
    }
  } else {
    // Nema podataka o korisniku, možda nije prijavljen
    console.warn('Nema spremljenih podataka o korisniku. Korisnik možda nije prijavljen.');
    // Opcionalno: preusmjeri na stranicu za prijavu
    // redirectToLogin();
  }
});

const redirectToLogin = () => {
  // Pretpostavljamo da imate rutu za prijavu pod nazivom 'login' ili putanjom '/login'
  router.push({ name: 'login' }); // Ili router.push('/login');
}

const editProfile = () => {
  // Logika za preusmjeravanje na stranicu za uređivanje profila
  // Npr. router.push({ name: 'edit-profile' });
  alert('Funkcionalnost uređivanja profila još nije implementirana.');
}

const logout = () => {
  // Logika za odjavu korisnika
  localStorage.removeItem('clan'); // Ukloni podatke o korisniku
  user.value = null;
  // Preusmjeri na stranicu za prijavu ili početnu stranicu
  // router.push({ name: 'login' });
  alert('Korisnik odjavljen.');
  redirectToLogin(); // Primjer preusmjeravanja
}
</script>

<style scoped>
.profile-card {
  width: 100%;
  max-width: 500px;
  border-radius: 8px; /* Dodaje malo zaobljenja */
}
.q-item__section--avatar {
  min-width: 40px; /* Malo smanji prostor za ikonu */
}
.text-subtitle1 {
  font-weight: 500;
}
/* Dodatna stilizacija po želji */
</style>
