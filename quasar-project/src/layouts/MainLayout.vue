<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-red">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title class="text-h2 text-center">
          FitLife
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-red text-white"
      @show="animateLinks"
    >
      <q-list>
        <q-item-label header class="text-center text-white q-pt-md">
          Glavni linkovi
        </q-item-label>

        <div>
          <q-item
            class="text-center"  v-for="link in linksList"
            :key="link.title"
          >
            <router-link
              :to="link.link"
              class="cursor-pointer text-white no-decoration"
            >
              <q-item-section avatar>
                <q-icon :name="link.icon" class="text-white text-center" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-white text-center">{{ link.title }}</q-item-label>
                <q-item-label caption class="text-white text-center">{{ link.caption }}</q-item-label>
              </q-item-section>
            </router-link>
          </q-item>

        </div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)
const linksList = ref([
  {
    title: 'Naslovnica',
    icon: 'home',
    link: '/',
    visible: true // All links set to visible
  },
  {
    title: 'Info',
    icon: 'home',
    link: '/info',
    visible: true // All links set to visible
  },
  {
    title: 'Popis Vježbi',
    icon: 'fitness_center',
    link: '/popisvjezbi',
    visible: true
  },
  {
    title: 'Trazi trenera',
    icon: 'search',
    link: '/trazitrenera',
    visible: true
  },
  {
    title: 'Lokacija',
    icon: 'place',
    link: '/lokacija',
    visible: true
  },
  {
    title: 'Login',
    icon: 'login',
    link: '/loginpage',
    visible: true
  },
  {
    title: 'Registracija',
    icon: 'person_add',
    link: '/registracija',
    visible: true
  },
  {
    title: 'O nama',
    icon: 'info',
    link: '/o_nama',
    visible: true
  }
])

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Removed the animateLinks function as it's no longer needed

</script>

<style scoped>
.cursor-pointer {
  cursor: pointer; /* Promijenite pokazivač kada se miša pomakne iznad linkova */
}
.no-decoration {
  text-decoration: none; /* Uklanja podvlačenje teksta u linkovima */
}

</style>