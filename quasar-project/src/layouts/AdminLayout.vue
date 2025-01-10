<template>
    <q-layout view="lHh Lpr lFf">
      <q-header elevated class="bg-white text-red">
        <q-toolbar>
          <q-toolbar-title class="text-h2 text-center">
            FitLife admin
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'


let title = computed(() => {
  return "FitLife admin"
})
const router = useRouter()
const rightDrawerOpen = ref(false);
const linksList = ref([
    { title: "Naslovnica", icon: "home", link: "/admin" },
    { title: "Popis Vježbi", icon: "fitness_center", link: "/admin/popisvjezbi" },
    { title: "Unesi Vježbu", icon: "self_improvement", link: "/admin/unosvjezbi" },
    { title: "Trazi trenera", icon: "search", link: "/admin/trazitrenera" },
    { title: "Unesi trenera", icon: "person", link: "/admin/unostrenera" },
    { title: "Logout", icon: "logout", link: "/admin/logout" },
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
  