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
          class="q-ml-auto"
        />
      </q-toolbar>
    </q-header>

    <!-- Drawer na desnoj strani -->
    <q-drawer
      side="right"
      v-model="rightDrawerOpen"
      show-if-above
      bordered
      class="custom-drawer bg-red text-white"
    >
      <q-list>
        <q-item-label header class="text-center text-white q-pt-md">
          Glavni linkovi
        </q-item-label>

        <!-- Linkovi -->
        <router-link
          v-for="link in linksList"
          :key="link.title"
          :to="link.link"
          class="custom-item no-decoration text-white"
          active-class="active-link"
        >
          <q-item clickable class="q-mb-sm">
            <q-item-section avatar>
              <q-icon :name="link.icon" class="text-white" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.title }}</q-item-label>
            </q-item-section>
          </q-item>
        </router-link>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";

const rightDrawerOpen = ref(false);
const linksList = ref([
  { title: "Naslovnica", icon: "home", link: "/" },
  { title: "Info", icon: "info", link: "/info" },
  { title: "Popis Vježbi", icon: "fitness_center", link: "/popisvjezbi" },
  { title: "Trazi trenera", icon: "search", link: "/trazitrenera" },
  { title: "Lokacija", icon: "place", link: "/lokacija" },
  { title: "Login", icon: "login", link: "/loginpage" },
  { title: "Registracija", icon: "person_add", link: "/registracija" },
  { title: "O nama", icon: "info", link: "/o_nama" },
]);

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value;
}
</script>

<style>
/* Prilagođeni stilovi za Drawer */
.custom-drawer {
  width: 250px; /* Širina drawera */
  border-radius: 8px; /* Zaobljeni rubovi */
  overflow: auto; /* Scroll za prevelik sadržaj */
}

/* Stilovi za klikabilne linkove */
.custom-item {
  display: block; /* Zauzima cijelu širinu */
  width: 100%;
}

.custom-item:hover q-item {
  background-color: rgba(255, 255, 255, 0.2); /* Pozadinska boja na hover */
}

/* Aktivni link */
.active-link q-item {
  background-color: rgba(255, 255, 255, 0.3); /* Pozadinska boja za aktivan link */
}

.no-decoration {
  text-decoration: none;
}

.text-white {
  color: white;
}
</style>
