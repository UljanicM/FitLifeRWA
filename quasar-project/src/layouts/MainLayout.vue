<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-red">
      <q-toolbar>
        <q-toolbar-title class="text-h2 text-center">
          FitLife
        </q-toolbar-title>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleRightDrawer"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="rightDrawerOpen"
      side="right"
      bordered
      behavior="mobile"
      bg-color="red"
      class="custom-drawer bg-red text-white"
    >
      <q-list>
        <q-item-label header class="text-center text-white q-pt-md">
          Glavni linkovi
        </q-item-label>

        <template v-for="linkItem in linksList" :key="linkItem.title">
          <q-item
            clickable
            v-ripple
            :to="linkItem.isActionItem ? undefined : linkItem.link"
            @click="linkItem.isActionItem ? linkItem.action() : null"
            class="q-mb-sm custom-q-item"
            active-class="active-link-qitem"
          >
            <q-item-section avatar>
              <q-icon :name="linkItem.icon" class="text-white" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-white">{{ linkItem.title }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from 'vue-router';

const rightDrawerOpen = ref(false);
const router = useRouter();

// Reaktivna varijabla za status prijave
const isLoggedIn = ref(false);

// Funkcija za provjeru statusa prijave
const updateLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('clan'); // Provjerava postoji li 'clan' u localStorage
  // Za robustnije rješenje, razmislite o Pinia state managementu.
};

// Pozovi provjeru statusa kada se komponenta montira i slušaj za promjene
onMounted(() => {
  updateLoginStatus();
  // Slušaj promjene u localStorage ako se prijava/odjava može dogoditi u drugom tabu
  window.addEventListener('storage', updateLoginStatus);
  // Slušaj custom event koji se može emitirati nakon prijave/odjave iz drugih komponenti
  window.addEventListener('auth-change', updateLoginStatus);
});

// Funkcija za odjavu
const handleLogout = () => {
  localStorage.removeItem('clan'); // Ukloni podatke o korisniku
  updateLoginStatus(); // Ažuriraj status prijave
  router.push({ name: 'login' }); // Preusmjeri na stranicu za prijavu (ime rute 'login' mora postojati)
};

// Dinamička lista linkova
const linksList = computed(() => {
  const baseLinks = [


  ];

  if (isLoggedIn.value) {
    return [
      ...baseLinks,
      { title: "Profil", icon: "account_circle", link: "/profil" }, // Link na UserProfilePage.vue
      { title: "Info", icon: "info", link: "/info" }, // Ruta za PitajPage.vue
      { title: "Popis Vježbi", icon: "fitness_center", link: "/popisvjezbi" },
      { title: "Traži trenera", icon: "search", link: "/trazitrenera" },
      { title: "Odjava", icon: "logout", action: handleLogout, isActionItem: true }
    ];
  } else {
    return [
      ...baseLinks,
      { title: "Naslovnica", icon: "home", link: "/" },
      { title: "Login", icon: "login", link: "/loginpage" },
      { title: "Registracija", icon: "person_add", link: "/registracija" },
    ];
  }
});

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value;
}
</script>

<style>
/* Prilagođeni stilovi za Drawer */
.custom-drawer {
  width: 250px; /* Širina drawera */
  /* border-radius: 8px; */ /* Zaobljeni rubovi - možete vratiti ako želite */
  overflow: auto; /* Scroll za prevelik sadržaj */
}

/* Stilovi za q-item unutar drawera */
.custom-q-item.q-item { /* Dodajemo .q-item za veću specifičnost ako je potrebno */
  color: white; /* Osigurava da je tekst bijel ako nije eksplicitno postavljen na labeli */
}

.custom-q-item:hover {
  background-color: rgba(255, 255, 255, 0.2) !important; /* Pozadinska boja na hover */
}

/* Aktivni link - Quasarova active-class će ovo primijeniti */
.active-link-qitem {
  background-color: rgba(255, 255, 255, 0.3) !important; /* Pozadinska boja za aktivan link */
}

/* Tekst unutar q-item-label je već bijel zbog .text-white na q-item-label */
/* Ako želite osigurati da ikone nasljeđuju boju: */
.custom-q-item .q-icon {
  color: white;
}

/* Uklanjanje defaultne dekoracije teksta ako bi se negdje pojavila (iako q-item to ne bi trebao imati) */
.no-decoration {
  text-decoration: none;
}

/* Osiguravanje da q-item-label unutar custom-q-item uvijek ima bijeli tekst */
/* Ovo je već riješeno s klasom text-white na q-item-label, ali kao fallback: */
.custom-q-item .q-item__label {
    color: white;
}
</style>