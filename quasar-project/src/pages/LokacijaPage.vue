<template>
  <div id="map" style="height: 100vh; width: 100%;"></div> <!-- Full viewport height for the map -->
  <q-page padding>
    <!-- content -->
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as L from 'leaflet';
import "leaflet/dist/leaflet.css";

export default {
  setup() {
    const initialMap = ref(null); // Initialize as null

    onMounted(() => {
        // Initialize the map at the specified location and zoom level
        initialMap.value = L.map('map').setView([45.344637, 14.314020], 13);

        // Correct the tile layer URL by replacing %7B/%7D with curly braces {}
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(initialMap.value);

        // Add a marker to the map
        const marker = L.marker([45.344637, 14.314020]).addTo(initialMap.value);
        marker.bindPopup('<b>Dynamic Fitness Opatija</b><br>Teretana').openPopup();
      });

    return {
      initialMap
    };
  }
}
</script>

<style scoped>
#map {
    width: 100%;   /* Full width */
    height: 100vh; /* Full viewport height */
}
</style>