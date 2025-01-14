<template>
  <q-page class="flex flex-center">
    <q-card dark bordered class="bg-grey-9 my-card">
      <!-- Slika i naslov -->
      <q-card-section>
        <q-img src="~assets/Fitlife1.jpg">
          <div class="text-h3 text-weight-bolder absolute-bottom text-center">O nama</div>
        </q-img>
      </q-card-section>

      <!-- Opis -->
      <q-card-section class="text-h4 text-justify">
        {{ o_nama }}
      </q-card-section>

      <!-- Kontakt podaci -->
      <q-card-section class="text-h5 q-mt-md">
        <div class="text-center">
          <p>Email: <a href="mailto:info@fitlife.com" class="text-primary">info@fitlife.com</a></p>
          <p>Broj mobitela: <span class="text-primary">+385 99 123 4567</span></p>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

// Definiranje reaktivne varijable
const o_nama = ref('Fitlife')
</script>

<style scoped>
.my-card {
  width: 100%;
}
.text-primary {
  color: #1976d2;
  font-weight: bold;
}
</style>
