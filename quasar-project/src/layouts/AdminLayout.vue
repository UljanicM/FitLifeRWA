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
import { useQuasar } from 'quasar'; 

const router = useRouter()
const $q = useQuasar(); 

let title = computed(() => {
  return "FitLife admin"
})
const rightDrawerOpen = ref(false);

const linksList = ref([
    { title: "Naslovnica", icon: "home", link: "/admin" },
    { title: "Trazi trenera", icon: "search", link: "/admin/trazitrenera" },
    { title: "Unesi trenera", icon: "person", link: "/admin/unostrenera" },
    { title: "Pregled Planova", icon: "assignment", link: "/admin/pregledplanova" },
    { title: "Logout", icon: "logout", link: "/admin/logout" },
]);

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value;
}
</script>

<style>

.custom-drawer {
  width: 250px; 
  border-radius: 8px; 
  overflow: auto; 
}


.custom-item {
  display: block; 
  width: 100%;
}

.custom-item:hover q-item {
  background-color: rgba(255, 255, 255, 0.2); 
}


.active-link q-item {
  background-color: rgba(255, 255, 255, 0.3); 
}

.no-decoration {
  text-decoration: none;
}

.text-white {
  color: white;
}
</style>
