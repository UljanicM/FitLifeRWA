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
import { useQuasar } from 'quasar';

const rightDrawerOpen = ref(false);
const router = useRouter();
const $q = useQuasar();

const isLoggedInMember = ref(false);
const isLoggedInTrainer = ref(false);


const updateLoginStatus = () => {
  const clanData = localStorage.getItem('clan');
  const trainerData = localStorage.getItem('trainer');

  isLoggedInMember.value = !!clanData;
  isLoggedInTrainer.value = !!trainerData;


};

onMounted(() => {
  updateLoginStatus();
  window.addEventListener('storage', updateLoginStatus);
  window.addEventListener('auth-change', updateLoginStatus);
});

const handleLogout = () => {
  $q.dialog({
    title: 'Potvrda odjave',
    message: 'Jeste li sigurni da se želite odjaviti?',
    cancel: 'Ne',
    ok: 'Da',
    persistent: true
  }).onOk(() => {
    localStorage.removeItem('clan');
    localStorage.removeItem('trainer'); 
    updateLoginStatus();
    $q.notify({
      type: 'info',
      message: 'Uspješno ste se odjavili.',
      position: 'top'
    });
    router.push('/loginpage');
  }).onCancel(() => {
    $q.notify({
      type: 'info',
      message: 'Odjava otkazana.',
      position: 'top'
    });
  });
};

const linksList = computed(() => {
  const baseLinks = [];

  
  if (isLoggedInMember.value) {
    
    return [
      { title: "Naslovnica", icon: "home", link: "/" },
      { title: "Profil", icon: "account_circle", link: "/profil" },
      { title: "Traži trenera", icon: "search", link: "/trazitrenera" },
      { title: "Popis Planova", icon: "assignment", link: "/popisplanova" },
      { title: "Pretraži Druge Članove", icon: "group", link: "/pretrazi-druge-clanove" },
      { title: "Pitaj AI", icon: "help", link: "/info" },
      { title: "O nama", icon: "info", link: "/onama" },
      { title: "Odjava", icon: "logout", action: handleLogout, isActionItem: true },
    ];
  } else if (isLoggedInTrainer.value) {
    return [
      ...baseLinks,
      { title: "Moj Profil", icon: "sports_gymnastics", link: "/trainer-profile" },
      { title: "Unos Plana", icon: "add_box", link: "/unos-plana" },
      { title: "Popis Planova", icon: "assignment", link: "/popisplanova" },
      { title: "Popis Drugih Članova", icon: "group", link: "/pretrazi-druge-clanove" },
      { title: "Traži trenera", icon: "search", link: "/trazitrenera" },
      { title: "Odjava", icon: "logout", action: handleLogout, isActionItem: true },
    ];
  } else {
    return [
      ...baseLinks,
      { title: "Naslovnica", icon: "home", link: "/" },
      { title: "Login", icon: "login", link: "/loginpage" },
      { title: "Registracija", icon: "person_add", link: "/registracija" },
      { title: "O nama", icon: "info", link: "/onama" },
    ];
  }
});

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value;
}
</script>

<style>
.custom-drawer {
  width: 250px;
  overflow: auto;
}

.custom-q-item.q-item {
  color: white;
}

.custom-q-item:hover {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.active-link-qitem {
  background-color: rgba(255, 255, 255, 0.3) !important;
}

.custom-q-item .q-icon {
  color: white;
}

.no-decoration {
  text-decoration: none;
}

.custom-q-item .q-item__label {
    color: white;
}
</style>
