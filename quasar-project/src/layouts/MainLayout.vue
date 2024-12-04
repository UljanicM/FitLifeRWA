<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title class="text-h2">
          Fitlife
        </q-toolbar-title>
        <div>Dobrodošli</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          Glavni linkovi
        </q-item-label>

        <!-- Zamjena q-item s router-link -->
        <router-link
          v-for="link in linksList"
          :key="link.title"
          :to="link.link"
          class="cursor-pointer"
        >
          <q-item>
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.title }}</q-item-label>
              <q-item-label caption>{{ link.caption }}</q-item-label>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const leftDrawerOpen = ref(false)
const linksList = 
[
  {
    title: 'Naslovnica',
    caption: 'Početna stranica',
    icon: 'home',
    link: '/'
  },
  {
    title: 'Popis Vježbi',
    caption: 'Popis svih dostupnih vježbi',
    icon: 'fitness_center',
    link: '/popisvjezbi'
  },
  {
    title: 'Trazi trenera',
    caption: 'Pretražujte Trenere',
    icon: 'search',
    link: '/trazitrenera'
  },
  {
    title: 'Lokacija',
    caption: 'Gdje se nalazimo',
    icon: 'place',
    link: '/lokacija'
  },
  {
    title: 'Login',
    caption: 'Prijava',
    icon: 'login',
    link: '/loginpage'
  },
  {
    title: 'Registracija',
    caption: 'Registrirajte se',
    icon: 'person_add',
    link: '/registracijapage'
  },
  {
    title: 'O nama',
    caption: 'Informacije o nama',
    icon: 'info',
    link: '/o_nama'

  }
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer; /* Promijenite pokazivač kada se miša pomakne iznad linkova */
}
</style>